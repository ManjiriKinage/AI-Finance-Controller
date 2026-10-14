import datetime
from decimal import Decimal
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Boolean, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from backend.database import Base
from backend.money import rupees_to_paise, paise_to_rupees, format_inr, quantize_inr

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
    amount = Column(Integer, nullable=False) # In Paise (1 INR = 100 paise)
    currency = Column(String, default="INR")
    status = Column(String, default="captured") # captured, failed, refunded
    method = Column(String, default="upi") # upi, card, netbanking, wallet
    fee = Column(Integer, default=0) # In Paise
    tax = Column(Integer, default=0) # In Paise (GST)
    amount_refunded = Column(Integer, default=0) # In Paise
    customer_email = Column(String, nullable=True)
    captured_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    @property
    def amount_rupees(self) -> float:
        return paise_to_rupees(self.amount)

    @property
    def fee_rupees(self) -> float:
        return paise_to_rupees(self.fee)

    @property
    def tax_rupees(self) -> float:
        return paise_to_rupees(self.tax)

    @property
    def amount_refunded_rupees(self) -> float:
        return paise_to_rupees(self.amount_refunded)

    @property
    def amount_paise(self) -> int:
        return self.amount

    @property
    def fee_paise(self) -> int:
        return self.fee

    @property
    def tax_paise(self) -> int:
        return self.tax

    @property
    def amount_refunded_paise(self) -> int:
        return self.amount_refunded

class Settlement(Base):
    __tablename__ = "settlements"

    id = Column(String, primary_key=True, index=True) # setl_xxx
    merchant_id = Column(String, ForeignKey("merchants.id"), default="mer_001")
    lineage_id = Column(String, index=True, nullable=True) # LIN-xxxx
    amount = Column(Integer, nullable=False) # Net settlement amount in Paise
    gross_amount = Column(Integer, default=0) # In Paise
    fees = Column(Integer, default=0) # In Paise
    tax = Column(Integer, default=0) # In Paise
    utr = Column(String, index=True, nullable=False)
    status = Column(String, default="processed") # processed, created, failed
    settlement_period = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    @property
    def amount_rupees(self) -> float:
        return paise_to_rupees(self.amount)

    @property
    def gross_amount_rupees(self) -> float:
        return paise_to_rupees(self.gross_amount)

    @property
    def fees_rupees(self) -> float:
        return paise_to_rupees(self.fees)

    @property
    def tax_rupees(self) -> float:
        return paise_to_rupees(self.tax)

    @property
    def amount_paise(self) -> int:
        return self.amount

    @property
    def gross_amount_paise(self) -> int:
        return self.gross_amount

    @property
    def fees_paise(self) -> int:
        return self.fees

    @property
    def tax_paise(self) -> int:
        return self.tax

class SettlementItem(Base):
    __tablename__ = "settlement_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    settlement_id = Column(String, ForeignKey("settlements.id"), index=True)
    payment_id = Column(String, ForeignKey("payments.id"), nullable=True, index=True)
    type = Column(String, default="payment") # payment, refund, adjustment
    amount = Column(Integer, nullable=False) # In Paise
    fee = Column(Integer, default=0) # In Paise
    tax = Column(Integer, default=0) # In Paise

    @property
    def amount_rupees(self) -> float:
        return paise_to_rupees(self.amount)

    @property
    def fee_rupees(self) -> float:
        return paise_to_rupees(self.fee)

    @property
    def tax_rupees(self) -> float:
        return paise_to_rupees(self.tax)

    @property
    def amount_paise(self) -> int:
        return self.amount

    @property
    def fee_paise(self) -> int:
        return self.fee

    @property
    def tax_paise(self) -> int:
        return self.tax

class BankTransaction(Base):
    __tablename__ = "bank_transactions"

    id = Column(String, primary_key=True, index=True) # tx_xxx
    lineage_id = Column(String, index=True, nullable=True) # LIN-xxxx
    transaction_date = Column(DateTime, nullable=False)
    value_date = Column(DateTime, nullable=False)
    description = Column(String, nullable=False)
    reference = Column(String, index=True, nullable=True)
    credit = Column(Integer, default=0) # In Paise
    debit = Column(Integer, default=0) # In Paise
    balance = Column(Integer, default=0) # In Paise
    bank_utr = Column(String, index=True, nullable=True)

    @property
    def credit_rupees(self) -> float:
        return paise_to_rupees(self.credit)

    @property
    def debit_rupees(self) -> float:
        return paise_to_rupees(self.debit)

    @property
    def balance_rupees(self) -> float:
        return paise_to_rupees(self.balance)

    @property
    def credit_paise(self) -> int:
        return self.credit

    @property
    def debit_paise(self) -> int:
        return self.debit

    @property
    def balance_paise(self) -> int:
        return self.balance

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
    expected_amount = Column(Integer, default=0) # In Paise
    actual_amount = Column(Integer, default=0) # In Paise
    difference = Column(Integer, default=0) # In Paise
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    @property
    def expected_amount_rupees(self) -> float:
        return paise_to_rupees(self.expected_amount)

    @property
    def actual_amount_rupees(self) -> float:
        return paise_to_rupees(self.actual_amount)

    @property
    def difference_rupees(self) -> float:
        return paise_to_rupees(self.difference)

    @property
    def expected_amount_paise(self) -> int:
        return self.expected_amount

    @property
    def actual_amount_paise(self) -> int:
        return self.actual_amount

    @property
    def difference_paise(self) -> int:
        return self.difference

class ExceptionRecord(Base):
    __tablename__ = "exceptions"

    id = Column(String, primary_key=True, index=True) # EX-0001
    lineage_id = Column(String, index=True, nullable=True) # LIN-xxxx
    recon_result_id = Column(Integer, ForeignKey("reconciliation_results.id"), nullable=True)
    settlement_id = Column(String, nullable=True)
    bank_transaction_id = Column(String, nullable=True)
    exception_type = Column(String, nullable=False)
    severity = Column(String, default="MEDIUM") # HIGH, MEDIUM, LOW
    expected_amount = Column(Integer, default=0) # In Paise
    actual_amount = Column(Integer, default=0) # In Paise
    difference = Column(Integer, default=0) # In Paise
    confidence = Column(Float, default=0.0)
    ai_explanation = Column(JSON, nullable=True)
    status = Column(String, default="OPEN") # OPEN, UNDER_REVIEW, RESOLVED, REJECTED
    recommended_action = Column(String, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    resolved_by = Column(String, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    @property
    def expected_amount_rupees(self) -> float:
        return paise_to_rupees(self.expected_amount)

    @property
    def actual_amount_rupees(self) -> float:
        return paise_to_rupees(self.actual_amount)

    @property
    def difference_rupees(self) -> float:
        return paise_to_rupees(self.difference)

    @property
    def expected_amount_paise(self) -> int:
        return self.expected_amount

    @property
    def actual_amount_paise(self) -> int:
        return self.actual_amount

    @property
    def difference_paise(self) -> int:
        return self.difference


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
    current_cash = Column(Integer, default=0) # In Paise
    pending_settlements = Column(Integer, default=0) # In Paise
    expected_receivables_7d = Column(Integer, default=0) # In Paise
    expected_outflows_7d = Column(Integer, default=0) # In Paise
    projected_7d = Column(Integer, default=0) # In Paise
    projected_30d = Column(Integer, default=0) # In Paise
    confidence_score = Column(Float, default=85.0)
    details = Column(JSON, nullable=True)

    @property
    def current_cash_rupees(self) -> float:
        return paise_to_rupees(self.current_cash)

    @property
    def pending_settlements_rupees(self) -> float:
        return paise_to_rupees(self.pending_settlements)

    @property
    def projected_7d_rupees(self) -> float:
        return paise_to_rupees(self.projected_7d)

    @property
    def projected_30d_rupees(self) -> float:
        return paise_to_rupees(self.projected_30d)

class ProcessedWebhook(Base):
    __tablename__ = "processed_webhooks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    gateway = Column(String, default="razorpay", index=True)
    event_id = Column(String, unique=True, index=True, nullable=False)
    event_type = Column(String, nullable=False)
    payload_hash = Column(String, nullable=True)
    status = Column(String, default="PROCESSED") # PROCESSED, DUPLICATE_SKIPPED, FAILED
    processed_at = Column(DateTime, default=datetime.datetime.utcnow)
