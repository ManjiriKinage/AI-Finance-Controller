import datetime
from decimal import Decimal, ROUND_HALF_UP
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Boolean, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from backend.database import Base

def quantize_inr(amount: float | int | Decimal | None) -> float:
    """
    Enforces strict decimal quantization to 2 decimal places (paise)
    to eliminate floating-point drift (e.g. 0.3000000004).
    """
    if amount is None:
        return 0.0
    d = Decimal(str(amount))
    return float(d.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))

class Merchant(Base):
    __tablename__ = "merchants"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    currency = Column(String, default="INR")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Payment(Base):
    __tablename__ = "payments"

    id = Column(String, primary_key=True, index=True) # pay_xxx
    merchant_id = Column(String, ForeignKey("merchants.id"), default="mer_001")
    lineage_id = Column(String, index=True, nullable=True) # LIN-xxxx
    order_id = Column(String, index=True)
    amount = Column(Float, nullable=False) # In Rupees (Quantized to 2 decimals)
    currency = Column(String, default="INR")
    status = Column(String, default="captured") # captured, failed, refunded
    method = Column(String, default="upi") # upi, card, netbanking, wallet
    fee = Column(Float, default=0.0)
    tax = Column(Float, default=0.0) # GST
    amount_refunded = Column(Float, default=0.0)
    customer_email = Column(String, nullable=True)
    captured_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Settlement(Base):
    __tablename__ = "settlements"

    id = Column(String, primary_key=True, index=True) # setl_xxx
    merchant_id = Column(String, ForeignKey("merchants.id"), default="mer_001")
    lineage_id = Column(String, index=True, nullable=True) # LIN-xxxx
    amount = Column(Float, nullable=False) # Net settlement amount
    gross_amount = Column(Float, default=0.0)
    fees = Column(Float, default=0.0)
    tax = Column(Float, default=0.0)
    utr = Column(String, index=True, nullable=False)
    status = Column(String, default="processed") # processed, created, failed
    settlement_period = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class SettlementItem(Base):
    __tablename__ = "settlement_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    settlement_id = Column(String, ForeignKey("settlements.id"), index=True)
    payment_id = Column(String, ForeignKey("payments.id"), nullable=True, index=True)
    type = Column(String, default="payment") # payment, refund, adjustment
    amount = Column(Float, nullable=False)
    fee = Column(Float, default=0.0)
    tax = Column(Float, default=0.0)

class BankTransaction(Base):
    __tablename__ = "bank_transactions"

    id = Column(String, primary_key=True, index=True) # tx_xxx
    lineage_id = Column(String, index=True, nullable=True) # LIN-xxxx
    transaction_date = Column(DateTime, nullable=False)
    value_date = Column(DateTime, nullable=False)
    description = Column(String, nullable=False)
    reference = Column(String, index=True, nullable=True)
    credit = Column(Float, default=0.0)
    debit = Column(Float, default=0.0)
    balance = Column(Float, default=0.0)
    bank_utr = Column(String, index=True, nullable=True)

class ReconciliationResult(Base):
    __tablename__ = "reconciliation_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    recon_batch_id = Column(String, index=True)
    lineage_id = Column(String, index=True, nullable=True) # LIN-xxxx
    settlement_id = Column(String, ForeignKey("settlements.id"), nullable=True, index=True)
    bank_transaction_id = Column(String, ForeignKey("bank_transactions.id"), nullable=True, index=True)
    match_status = Column(String, default="UNRESOLVED") # MATCHED, PARTIAL, MISMATCH, UNRESOLVED, AUTO_RESOLVED
    match_score = Column(Float, default=0.0)
    matching_method = Column(String, default="RULE_UTR") # EXACT_UTR, FUZZY_NARRATION, AGGREGATE, AI_ASSISTED, MANUAL
    expected_amount = Column(Float, default=0.0)
    actual_amount = Column(Float, default=0.0)
    difference = Column(Float, default=0.0)
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ExceptionRecord(Base):
    __tablename__ = "exceptions"

    id = Column(String, primary_key=True, index=True) # EX-0001
    lineage_id = Column(String, index=True, nullable=True) # LIN-xxxx
    recon_result_id = Column(Integer, ForeignKey("reconciliation_results.id"), nullable=True)
    settlement_id = Column(String, nullable=True)
    bank_transaction_id = Column(String, nullable=True)
    exception_type = Column(String, nullable=False)
    severity = Column(String, default="MEDIUM") # HIGH, MEDIUM, LOW
    expected_amount = Column(Float, default=0.0)
    actual_amount = Column(Float, default=0.0)
    difference = Column(Float, default=0.0)
    confidence = Column(Float, default=0.0)
    ai_explanation = Column(JSON, nullable=True)
    status = Column(String, default="OPEN") # OPEN, UNDER_REVIEW, RESOLVED, REJECTED
    recommended_action = Column(String, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    resolved_by = Column(String, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    entity_type = Column(String, nullable=False)
    entity_id = Column(String, nullable=False)
    lineage_id = Column(String, index=True, nullable=True)
    action = Column(String, nullable=False)
    actor = Column(String, default="AI_CONTROLLER")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    before_state = Column(JSON, nullable=True)
    after_state = Column(JSON, nullable=True)
    reason = Column(Text, nullable=True)

class ForecastSnapshot(Base):
    __tablename__ = "forecast_snapshots"

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(DateTime, default=datetime.datetime.utcnow)
    current_cash = Column(Float, default=0.0)
    pending_settlements = Column(Float, default=0.0)
    expected_receivables_7d = Column(Float, default=0.0)
    expected_outflows_7d = Column(Float, default=0.0)
    projected_7d = Column(Float, default=0.0)
    projected_30d = Column(Float, default=0.0)
    confidence_score = Column(Float, default=85.0)
    details = Column(JSON, nullable=True)

class ProcessedWebhook(Base):
    __tablename__ = "processed_webhooks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    gateway = Column(String, default="razorpay", index=True)
    event_id = Column(String, unique=True, index=True, nullable=False)
    event_type = Column(String, nullable=False)
    payload_hash = Column(String, nullable=True)
    status = Column(String, default="PROCESSED") # PROCESSED, DUPLICATE_SKIPPED, FAILED
    processed_at = Column(DateTime, default=datetime.datetime.utcnow)
