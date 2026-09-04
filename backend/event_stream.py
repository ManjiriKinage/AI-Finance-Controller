import datetime
import random
import uuid
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from backend.models import Payment, Settlement, BankTransaction, ExceptionRecord
from backend.recon_engine import ReconciliationEngine

# In-memory circular buffer for recent live webhook events
RECENT_EVENTS: List[Dict[str, Any]] = []

def generate_live_webhook_event(db: Session, event_type: Optional[str] = None) -> Dict[str, Any]:
    """
    Simulates a live Razorpay webhook arriving in real time.
    """
    global RECENT_EVENTS
    
    if not event_type:
        event_type = random.choice([
            "payment.captured",
            "payment.captured",
            "settlement.processed",
            "refund.created"
        ])

    event_id = f"evt_{uuid.uuid4().hex[:12]}"
    now = datetime.datetime.now()
    now_str = now.strftime("%H:%M:%S")

    if event_type == "payment.captured":
        amt = round(random.choice([2500.0, 4800.0, 7500.0, 12000.0, 18500.0]), 2)
        pay_id = f"pay_live_{random.randint(1000, 9999)}"
        order_id = f"ord_live_{random.randint(10000, 99999)}"
        fee = round(amt * 0.02, 2)
        tax = round(fee * 0.18, 2)

        p = Payment(
            id=pay_id,
            merchant_id="mer_001",
            lineage_id=f"LIN-{random.randint(100000, 999999)}",
            order_id=order_id,
            amount=amt,
            currency="INR",
            status="captured",
            method="upi",
            fee=fee,
            tax=tax,
            created_at=now
        )
        db.add(p)
        db.commit()

        event_data = {
            "event_id": event_id,
            "event_type": "payment.captured",
            "entity_id": pay_id,
            "amount": amt,
            "timestamp": now_str,
            "narration": f"UPI Payment authorized for {order_id} (Net: ₹{(amt - fee - tax):,.2f})",
            "status": "RECONCILED",
            "processing_time_ms": round(random.uniform(1.2, 4.8), 2),
            "cash_impact": amt
        }

    elif event_type == "settlement.processed":
        amt = round(random.choice([48500.0, 85000.0, 124000.0, 210000.0]), 2)
        setl_id = f"setl_live_{random.randint(1000, 9999)}"
        utr = f"AXIS{random.randint(10000000, 99999999)}"

        s = Settlement(
            id=setl_id,
            merchant_id="mer_001",
            lineage_id=f"LIN-{utr[-6:]}",
            amount=amt,
            gross_amount=round(amt * 1.025, 2),
            fees=round(amt * 0.02, 2),
            tax=round(amt * 0.0036, 2),
            utr=utr,
            status="processed",
            created_at=now
        )
        db.add(s)
        db.commit()

        ReconciliationEngine(db).run_reconciliation()

        event_data = {
            "event_id": event_id,
            "event_type": "settlement.processed",
            "entity_id": setl_id,
            "amount": amt,
            "timestamp": now_str,
            "narration": f"Razorpay payout batch {setl_id} (UTR: {utr}) initiated",
            "status": "EXCEPTION_FLAGGED",
            "processing_time_ms": round(random.uniform(2.1, 6.4), 2),
            "cash_impact": amt
        }

    else: # refund.created
        amt = round(random.choice([800.0, 1500.0, 3200.0]), 2)
        ref_id = f"rfnd_{random.randint(1000, 9999)}"
        event_data = {
            "event_id": event_id,
            "event_type": "refund.created",
            "entity_id": ref_id,
            "amount": amt,
            "timestamp": now_str,
            "narration": f"Customer return debit authorized (Holdback applied)",
            "status": "PROCESSED",
            "processing_time_ms": round(random.uniform(1.0, 3.5), 2),
            "cash_impact": -amt
        }

    RECENT_EVENTS.insert(0, event_data)
    if len(RECENT_EVENTS) > 20:
        RECENT_EVENTS.pop()

    return event_data

def inject_live_delayed_settlement(db: Session, amount: float = 26400.0) -> Dict[str, Any]:
    """
    Simulates injecting a live delayed payout anomaly for hackathon demos.
    """
    global RECENT_EVENTS
    now = datetime.datetime.now()
    now_str = now.strftime("%H:%M:%S")
    setl_id = f"setl_demo_{random.randint(100, 999)}"
    utr = f"AXIS{random.randint(10000000, 99999999)}"
    lineage_id = f"LIN-{utr[-6:]}"

    s = Settlement(
        id=setl_id,
        merchant_id="mer_001",
        lineage_id=lineage_id,
        amount=amount,
        gross_amount=round(amount * 1.025, 2),
        fees=round(amount * 0.02, 2),
        tax=round(amount * 0.0036, 2),
        utr=utr,
        status="processed",
        created_at=now
    )
    db.add(s)
    db.commit()

    # Re-reconcile
    ReconciliationEngine(db).run_reconciliation()

    # Create explicit exception record
    ex_id = f"EX-DEMO-{random.randint(10, 99)}"
    ex = ExceptionRecord(
        id=ex_id,
        lineage_id=lineage_id,
        settlement_id=setl_id,
        exception_type="MISSING_SETTLEMENT",
        severity="HIGH",
        expected_amount=amount,
        actual_amount=0.0,
        difference=amount,
        confidence=94.5,
        status="OPEN",
        ai_explanation={
            "summary": f"Injected Live Demo: Payout batch {setl_id} pending bank clearance (Exposure: ₹{amount:,.2f}).",
            "likely_cause": "Bank clearing window delay (T+2 lag)",
            "confidence": 94.5,
            "evidence": [
                {"factor": "UTR Reference Match", "status": "DISCREPANCY", "detail": f"UTR {utr} pending credit"},
                {"factor": "Amount Exposure", "status": "WARNING", "detail": f"₹{amount:,.2f} uncredited"}
            ],
            "recommended_action": "Hold settlement or approve bridge adjustment"
        },
        recommended_action="Review Axis Bank clearing status or trigger bridge resolution."
    )
    db.add(ex)
    db.commit()

    evt_data = {
        "event_id": f"evt_demo_{uuid.uuid4().hex[:8]}",
        "event_type": "settlement.processed",
        "entity_id": setl_id,
        "amount": amount,
        "timestamp": now_str,
        "narration": f"DEMO INJECTION: Payout {setl_id} (UTR: {utr}) uncredited in bank statement",
        "status": "EXCEPTION_FLAGGED",
        "processing_time_ms": 2.4,
        "cash_impact": amount
    }
    RECENT_EVENTS.insert(0, evt_data)

    return {
        "status": "INJECTED",
        "settlement_id": setl_id,
        "exception_id": ex_id,
        "amount_exposed": amount,
        "lineage_id": lineage_id,
        "message": f"Simulated ₹{amount:,.2f} delayed payout anomaly. Cash at risk increased by +₹{amount:,.2f}."
    }

def get_recent_events() -> List[Dict[str, Any]]:
    global RECENT_EVENTS
    if not RECENT_EVENTS:
        now_str = datetime.datetime.now().strftime("%H:%M:%S")
        RECENT_EVENTS = [
            {
                "event_id": "evt_init_01",
                "event_type": "payment.captured",
                "entity_id": "pay_9821",
                "amount": 12500.0,
                "timestamp": now_str,
                "narration": "UPI checkout order_9821 captured & verified",
                "status": "RECONCILED",
                "processing_time_ms": 1.4,
                "cash_impact": 12500.0
            }
        ]
    return RECENT_EVENTS
