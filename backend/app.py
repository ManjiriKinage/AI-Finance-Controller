import os
import json
import hashlib
import datetime
from contextlib import asynccontextmanager
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, Depends, HTTPException, Query, Body, Header, Request, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.database import engine, get_db, Base, SessionLocal
from backend.models import (
    Merchant, Payment, Settlement, SettlementItem,
    BankTransaction, ReconciliationResult, ExceptionRecord, AuditLog, ForecastSnapshot,
    ProcessedWebhook, quantize_inr
)
from backend.schemas import (
    OverviewMetrics, BenchmarkMetrics, CashForecastResponse,
    ExceptionResponse, ExceptionActionRequest, ReconciliationResultResponse,
    CopilotChatRequest, CopilotChatResponse, PaymentResponse, SettlementResponse, BankTransactionResponse,
    DailyCloseResponse, MoneyTrailResponse, WhatIfSimulationResponse, InvestigationTraceResponse, LiveWebhookEvent,
    AuditReplayResponse, ReliabilityMetrics, CloseRouteOption,
    AccuracyStressTestResponse, CalculationProofResponse, ChallengeControllerResponse, DecisionGateResponse
)
from backend.security import verify_razorpay_signature, RAZORPAY_WEBHOOK_SECRET, BYPASS_SIGNATURE_VERIFY
from backend.synthetic_data import generate_synthetic_dataset
from backend.recon_engine import ReconciliationEngine
from backend.ai_service import AIControllerService
from backend.cash_intelligence import CashIntelligenceEngine
from backend.daily_close import DailyCloseEngine
from backend.what_if import WhatIfEngine
from backend.event_stream import generate_live_webhook_event, get_recent_events, inject_live_delayed_settlement

# Initialize tables
Base.metadata.create_all(bind=engine)

GLOBAL_GROUND_TRUTH = []

def seed_database_internal(db: Session, num_payments: int = 500):
    global GLOBAL_GROUND_TRUTH
    db.query(ProcessedWebhook).delete()
    db.query(AuditLog).delete()
    db.query(ExceptionRecord).delete()
    db.query(ReconciliationResult).delete()
    db.query(SettlementItem).delete()
    db.query(Settlement).delete()
    db.query(Payment).delete()
    db.query(BankTransaction).delete()
    db.query(Merchant).delete()
    db.commit()

    mer = Merchant(id="mer_001", name="Acme HyperCommerce India Pvt Ltd", currency="INR")
    db.add(mer)
    db.commit()

    dataset = generate_synthetic_dataset(num_payments=num_payments)
    GLOBAL_GROUND_TRUTH = dataset["ground_truth"]

    for p in dataset["payments"]:
        db.add(Payment(
            id=p["id"],
            merchant_id=p["merchant_id"],
            lineage_id=f"LIN-{(p['id'])[-6:]}",
            order_id=p["order_id"],
            amount=quantize_inr(p["amount"]),
            currency=p["currency"],
            status=p["status"],
            method=p["method"],
            fee=quantize_inr(p["fee"]),
            tax=quantize_inr(p["tax"]),
            amount_refunded=quantize_inr(p["amount_refunded"]),
            customer_email=p["customer_email"],
            captured_at=datetime.datetime.fromisoformat(p["captured_at"]) if p["captured_at"] else None,
            created_at=datetime.datetime.fromisoformat(p["created_at"])
        ))

    for s in dataset["settlements"]:
        db.add(Settlement(
            id=s["id"],
            merchant_id=s["merchant_id"],
            lineage_id=f"LIN-{(s['utr'])[-6:]}",
            amount=quantize_inr(s["amount"]),
            gross_amount=quantize_inr(s["gross_amount"]),
            fees=quantize_inr(s["fees"]),
            tax=quantize_inr(s["tax"]),
            utr=s["utr"],
            status=s["status"],
            settlement_period=s["settlement_period"],
            created_at=datetime.datetime.fromisoformat(s["created_at"])
        ))

    for si in dataset["settlement_items"]:
        db.add(SettlementItem(
            settlement_id=si["settlement_id"],
            payment_id=si["payment_id"],
            type=si["type"],
            amount=quantize_inr(si["amount"]),
            fee=quantize_inr(si["fee"]),
            tax=quantize_inr(si["tax"])
        ))

    for b in dataset["bank_transactions"]:
        db.add(BankTransaction(
            id=b["id"],
            lineage_id=f"LIN-{(b['bank_utr'] or b['reference'] or '928173')[-6:]}",
            transaction_date=datetime.datetime.fromisoformat(b["transaction_date"]),
            value_date=datetime.datetime.fromisoformat(b["value_date"]),
            description=b["description"],
            reference=b["reference"],
            credit=quantize_inr(b["credit"]),
            debit=quantize_inr(b["debit"]),
            balance=quantize_inr(b["balance"]),
            bank_utr=b["bank_utr"]
        ))

    db.commit()

    engine_inst = ReconciliationEngine(db)
    engine_inst.run_reconciliation()
    print("Database successfully seeded, quantized, and reconciled.")

@asynccontextmanager
async def lifespan(app: FastAPI):
    db = SessionLocal()
    try:
        if db.query(Payment).count() == 0:
            print("Auto-seeding database on first startup...")
            seed_database_internal(db, num_payments=500)
    finally:
        db.close()
    yield

app = FastAPI(
    title="Autonomous Finance Cloud (ReconOps) API",
    description="Deterministic Multi-Source Reconciliation, Cryptographic Webhook Ingestion, and Cash Governance",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Autonomous Finance Cloud (ReconOps)",
        "signature_verification": "ACTIVE" if not BYPASS_SIGNATURE_VERIFY else "SANDBOX_BYPASS_MODE",
        "timestamp": datetime.datetime.now(datetime.UTC).isoformat()
    }

# --- Production Webhook Ingestion with Signature & Idempotency ---

@app.post("/api/webhooks/razorpay")
async def ingest_razorpay_webhook(
    request: Request,
    x_razorpay_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Authenticates incoming Razorpay webhook events using HMAC SHA256 signature verification
    and enforces strict deduplication/idempotency protection.
    """
    raw_body = await request.body()
    
    # 1. Cryptographic HMAC SHA256 Signature Verification
    is_valid, reason = verify_razorpay_signature(raw_body, x_razorpay_signature)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Webhook authentication failed: {reason}"
        )
        
    try:
        payload = json.loads(raw_body.decode("utf-8")) if raw_body else {}
    except Exception:
        raise HTTPException(status_code=400, detail="Malformed JSON payload")
        
    event_id = payload.get("id") or f"evt_{hashlib.md5(raw_body).hexdigest()[:12]}"
    event_type = payload.get("event") or "payment.captured"
    payload_hash = hashlib.sha256(raw_body).hexdigest()
    
    # 2. Idempotency Check: Prevent duplicate webhook retries from corrupting ledger
    existing_event = db.query(ProcessedWebhook).filter(ProcessedWebhook.event_id == event_id).first()
    if existing_event:
        return {
            "status": "DUPLICATE_EVENT_SAFELY_SKIPPED",
            "message": f"Event {event_id} was already processed at {existing_event.processed_at.isoformat()}",
            "event_id": event_id,
            "deduplication_enforced": True
        }
        
    # Record webhook in idempotency tracking log
    webhook_log = ProcessedWebhook(
        gateway="razorpay",
        event_id=event_id,
        event_type=event_type,
        payload_hash=payload_hash,
        status="PROCESSED"
    )
    db.add(webhook_log)
    db.commit()
    
    # Process entity payload
    entity = payload.get("payload", {}).get("payment", {}).get("entity") or {}
    if entity and "id" in entity:
        amt = quantize_inr(float(entity.get("amount", 0)) / 100.0) # Razorpay amounts in paise
        pay_id = entity.get("id")
        if not db.query(Payment).filter(Payment.id == pay_id).first():
            db.add(Payment(
                id=pay_id,
                order_id=entity.get("order_id", "order_live_001"),
                lineage_id=f"LIN-{(pay_id)[-6:]}",
                amount=amt,
                currency=entity.get("currency", "INR"),
                status=entity.get("status", "captured"),
                method=entity.get("method", "upi"),
                fee=quantize_inr(float(entity.get("fee", 0)) / 100.0),
                tax=quantize_inr(float(entity.get("tax", 0)) / 100.0),
                created_at=datetime.datetime.now(datetime.UTC)
            ))
            db.commit()
            
    return {
        "status": "PROCESSED",
        "event_id": event_id,
        "event_type": event_type,
        "auth_status": reason,
        "deduplication_enforced": True
    }

@app.post("/api/seed")
def seed_dataset(num_payments: int = Query(500, ge=50, le=2000), db: Session = Depends(get_db)):
    seed_database_internal(db, num_payments=num_payments)
    return {"message": f"Successfully regenerated {num_payments} payments, settlements, and bank statement."}

@app.get("/api/overview", response_model=OverviewMetrics)
def get_overview(db: Session = Depends(get_db)):
    total_settlements = db.query(Settlement).count()
    matched_count = db.query(ReconciliationResult).filter(ReconciliationResult.match_status == "MATCHED").count()
    exceptions = db.query(ExceptionRecord).all()
    exceptions_count = len(exceptions)
    
    match_rate = round((matched_count / max(1, total_settlements)) * 100, 2)
    
    expected_settlement_total = db.query(func.sum(Settlement.amount)).scalar() or 0.0
    actual_bank_credit_total = db.query(func.sum(BankTransaction.credit)).scalar() or 0.0
    
    open_exceptions = [e for e in exceptions if e.status == "OPEN" and e.exception_type != "DUPLICATE_ENTRY"]
    unexplained_diff = quantize_inr(sum(e.difference for e in open_exceptions))
    
    auto_resolved = sum(1 for e in exceptions if e.status == "RESOLVED")
    human_review = sum(1 for e in exceptions if e.status == "OPEN")

    ex_breakdown = {}
    sev_breakdown = {"HIGH": 0, "MEDIUM": 0, "LOW": 0}
    why_by_type = {}
    
    for e in exceptions:
        ex_breakdown[e.exception_type] = ex_breakdown.get(e.exception_type, 0) + 1
        sev_breakdown[e.severity] = sev_breakdown.get(e.severity, 0) + 1
        if e.status == "OPEN":
            why_by_type[e.exception_type] = quantize_inr(why_by_type.get(e.exception_type, 0.0) + e.difference)

    return {
        "total_transactions": total_settlements + db.query(BankTransaction).count(),
        "matched_count": matched_count,
        "exceptions_count": exceptions_count,
        "match_rate": match_rate,
        "expected_settlement_total": quantize_inr(expected_settlement_total),
        "actual_bank_credit_total": quantize_inr(actual_bank_credit_total),
        "unexplained_difference": unexplained_diff,
        "auto_resolved_count": auto_resolved,
        "human_review_required": human_review,
        "exception_breakdown": ex_breakdown,
        "severity_breakdown": sev_breakdown,
        "why_breakdown": {
            "total_unreconciled": unexplained_diff,
            "causes": why_by_type,
            "top_cause": max(why_by_type, key=why_by_type.get) if why_by_type else "None",
            "most_likely_source": "Razorpay settlement dispute reserves and unlisted gateway deductions"
        }
    }

@app.post("/api/reconcile/run")
def run_reconciliation(db: Session = Depends(get_db)):
    engine_inst = ReconciliationEngine(db)
    result = engine_inst.run_reconciliation()
    return result

@app.get("/api/benchmark", response_model=BenchmarkMetrics)
def get_benchmark(db: Session = Depends(get_db)):
    global GLOBAL_GROUND_TRUTH
    if not GLOBAL_GROUND_TRUTH:
        import csv
        csv_path = os.path.join(os.path.dirname(__file__), "data", "ground_truth.csv")
        if os.path.exists(csv_path):
            with open(csv_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                GLOBAL_GROUND_TRUTH = list(reader)
                
    engine_inst = ReconciliationEngine(db)
    return engine_inst.compute_evaluation_benchmark(GLOBAL_GROUND_TRUTH)

# --- Phase 4: Accuracy, Safety & Adversarial Endpoints ---

@app.post("/api/accuracy/stress-test", response_model=AccuracyStressTestResponse)
def run_accuracy_stress_test(num_records: int = Query(5000, ge=1000, le=20000), db: Session = Depends(get_db)):
    engine_inst = ReconciliationEngine(db)
    return engine_inst.run_accuracy_stress_test(num_records=num_records)

@app.get("/api/calculation-proof/{settlement_id}", response_model=CalculationProofResponse)
def get_calculation_proof(settlement_id: str, db: Session = Depends(get_db)):
    engine_inst = ReconciliationEngine(db)
    return engine_inst.get_calculation_proof(settlement_id)

@app.post("/api/recon/challenge/{result_id}", response_model=ChallengeControllerResponse)
def challenge_decision(result_id: int, db: Session = Depends(get_db)):
    engine_inst = ReconciliationEngine(db)
    return engine_inst.challenge_match_decision(result_id)

@app.get("/api/recon/decision-gate/{result_id}", response_model=DecisionGateResponse)
def get_decision_gate(result_id: int, db: Session = Depends(get_db)):
    engine_inst = ReconciliationEngine(db)
    return engine_inst.get_decision_gate_explanation(result_id)

# --- AI Daily Close & Money Trail Endpoints ---

@app.get("/api/daily-close/status", response_model=DailyCloseResponse)
@app.post("/api/daily-close/run", response_model=DailyCloseResponse)
def get_daily_close(db: Session = Depends(get_db)):
    close_eng = DailyCloseEngine(db)
    return close_eng.compute_daily_close()

@app.get("/api/money-trail/{settlement_id}", response_model=MoneyTrailResponse)
def get_money_trail(settlement_id: str, db: Session = Depends(get_db)):
    close_eng = DailyCloseEngine(db)
    res = close_eng.get_money_trail(settlement_id)
    if not res:
        raise HTTPException(status_code=404, detail=f"Money trail for {settlement_id} not found")
    return res

# --- What-If Resolution Simulator & Deep Investigator Endpoints ---

@app.post("/api/what-if/simulate", response_model=WhatIfSimulationResponse)
def simulate_what_if(exception_id: str = Query(...), db: Session = Depends(get_db)):
    what_if_eng = WhatIfEngine(db)
    return what_if_eng.simulate_exception_resolution(exception_id)

@app.get("/api/investigate/{exception_id}", response_model=InvestigationTraceResponse)
def get_investigation_trace(exception_id: str, db: Session = Depends(get_db)):
    what_if_eng = WhatIfEngine(db)
    return what_if_eng.run_deep_investigation(exception_id)

@app.get("/api/close-routes", response_model=List[CloseRouteOption])
def get_close_routes(db: Session = Depends(get_db)):
    what_if_eng = WhatIfEngine(db)
    return what_if_eng.compute_fastest_close_routes()

@app.get("/api/audit-replay/{exception_id}", response_model=AuditReplayResponse)
def get_audit_replay(exception_id: str, db: Session = Depends(get_db)):
    close_eng = DailyCloseEngine(db)
    return close_eng.get_audit_replay(exception_id)

@app.get("/api/reliability-matrix", response_model=ReliabilityMetrics)
def get_reliability_matrix(db: Session = Depends(get_db)):
    close_eng = DailyCloseEngine(db)
    return close_eng.get_reliability_matrix()

# --- Live Webhook Event Stream Endpoints ---

@app.post("/api/events/simulate-incoming", response_model=LiveWebhookEvent)
def trigger_live_event(event_type: Optional[str] = None, db: Session = Depends(get_db)):
    return generate_live_webhook_event(db, event_type=event_type)

@app.post("/api/events/inject-anomaly")
def inject_anomaly_endpoint(amount: float = Query(26400.0), db: Session = Depends(get_db)):
    return inject_live_delayed_settlement(db, amount=amount)

@app.get("/api/events/recent", response_model=List[LiveWebhookEvent])
def list_recent_events():
    return get_recent_events()

# --- Core Queries & Actions ---

@app.get("/api/reconcile/results", response_model=List[ReconciliationResultResponse])
def get_reconciliation_results(
    status: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(ReconciliationResult)
    if status:
        query = query.filter(ReconciliationResult.match_status == status.upper())
    return query.limit(limit).all()

@app.get("/api/exceptions", response_model=List[ExceptionResponse])
def get_exceptions(
    severity: Optional[str] = None,
    status: Optional[str] = None,
    exception_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ExceptionRecord)
    if severity:
        query = query.filter(ExceptionRecord.severity == severity.upper())
    if status:
        query = query.filter(ExceptionRecord.status == status.upper())
    if exception_type:
        query = query.filter(ExceptionRecord.exception_type == exception_type.upper())
    
    exceptions = query.all()
    severity_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    status_order = {"OPEN": 0, "UNDER_REVIEW": 1, "RESOLVED": 2, "REJECTED": 3}
    
    exceptions.sort(key=lambda x: (status_order.get(x.status, 9), severity_order.get(x.severity, 9), -x.difference))
    return exceptions

@app.get("/api/exceptions/{exception_id}", response_model=ExceptionResponse)
def get_exception_detail(exception_id: str, db: Session = Depends(get_db)):
    ex = db.query(ExceptionRecord).filter(ExceptionRecord.id == exception_id).first()
    if not ex:
        raise HTTPException(status_code=404, detail="Exception not found")
    
    if not ex.ai_explanation:
        ai_serv = AIControllerService(db)
        ex.ai_explanation = ai_serv.explain_exception(exception_id)
        db.commit()
        
    return ex

@app.post("/api/exceptions/{exception_id}/action", response_model=ExceptionResponse)
def handle_exception_action(
    exception_id: str,
    action_req: ExceptionActionRequest,
    db: Session = Depends(get_db)
):
    ex = db.query(ExceptionRecord).filter(ExceptionRecord.id == exception_id).first()
    if not ex:
        raise HTTPException(status_code=404, detail="Exception not found")
        
    before_state = {"status": ex.status, "notes": ex.resolution_notes}
    
    if action_req.action in ["APPROVE_ADJUSTMENT", "MANUAL_RESOLVE", "FORCE_MATCH"]:
        ex.status = "RESOLVED"
        ex.resolved_by = action_req.actor
        ex.resolved_at = datetime.datetime.now(datetime.UTC)
        ex.resolution_notes = action_req.notes or f"Action {action_req.action} applied by {action_req.actor}."
    elif action_req.action == "REJECT":
        ex.status = "REJECTED"
        ex.resolved_by = action_req.actor
        ex.resolved_at = datetime.datetime.now(datetime.UTC)
        ex.resolution_notes = action_req.notes or "Rejected by finance ops."
    elif action_req.action == "MARK_DISPUTED":
        ex.status = "UNDER_REVIEW"
        ex.resolution_notes = action_req.notes or "Marked under bank dispute investigation."

    audit = AuditLog(
        entity_type="EXCEPTION",
        entity_id=ex.id,
        lineage_id=ex.lineage_id,
        action=action_req.action,
        actor=action_req.actor,
        before_state=before_state,
        after_state={"status": ex.status, "notes": ex.resolution_notes},
        reason=action_req.notes
    )
    db.add(audit)
    db.commit()
    db.refresh(ex)
    return ex

@app.get("/api/forecast", response_model=CashForecastResponse)
def get_cash_forecast(db: Session = Depends(get_db)):
    engine_inst = CashIntelligenceEngine(db)
    return engine_inst.compute_cash_intelligence()

@app.post("/api/copilot/chat", response_model=CopilotChatResponse)
def copilot_chat(req: CopilotChatRequest, db: Session = Depends(get_db)):
    ai_serv = AIControllerService(db)
    response_dict = ai_serv.answer_copilot_query(req.query)
    return response_dict

@app.get("/api/payments", response_model=List[PaymentResponse])
def get_payments(limit: int = 50, db: Session = Depends(get_db)):
    return db.query(Payment).limit(limit).all()

@app.get("/api/settlements", response_model=List[SettlementResponse])
def get_settlements(limit: int = 50, db: Session = Depends(get_db)):
    return db.query(Settlement).limit(limit).all()

@app.get("/api/bank-transactions", response_model=List[BankTransactionResponse])
def get_bank_transactions(limit: int = 50, db: Session = Depends(get_db)):
    return db.query(BankTransaction).limit(limit).all()
