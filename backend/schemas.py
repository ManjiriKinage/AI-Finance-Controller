from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

# Payment Schemas
class PaymentBase(BaseModel):
    id: str
    order_id: str
    amount: float
    currency: str = "INR"
    status: str = "captured"
    method: str = "upi"
    fee: float = 0.0
    tax: float = 0.0
    amount_refunded: float = 0.0
    lineage_id: Optional[str] = None
    customer_email: Optional[str] = None
    created_at: Optional[datetime] = None

class PaymentResponse(PaymentBase):
    merchant_id: str
    captured_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# Settlement Schemas
class SettlementBase(BaseModel):
    id: str
    amount: float
    gross_amount: float = 0.0
    fees: float = 0.0
    tax: float = 0.0
    utr: str
    status: str = "processed"
    lineage_id: Optional[str] = None
    settlement_period: Optional[str] = None
    created_at: Optional[datetime] = None

class SettlementResponse(SettlementBase):
    merchant_id: str

    model_config = ConfigDict(from_attributes=True)

# Bank Transaction Schemas
class BankTransactionBase(BaseModel):
    id: str
    transaction_date: datetime
    value_date: datetime
    description: str
    reference: Optional[str] = None
    credit: float = 0.0
    debit: float = 0.0
    balance: float = 0.0
    bank_utr: Optional[str] = None
    lineage_id: Optional[str] = None

class BankTransactionResponse(BankTransactionBase):
    model_config = ConfigDict(from_attributes=True)

# Exception Evidence and Explanations
class EvidenceItem(BaseModel):
    factor: str
    status: str
    detail: str

class AIExplanation(BaseModel):
    summary: str
    likely_cause: str
    confidence: float
    evidence: List[EvidenceItem]
    recommended_action: str
    auto_resolvable: bool = False

# Exception Schemas
class ExceptionResponse(BaseModel):
    id: str
    recon_result_id: Optional[int] = None
    settlement_id: Optional[str] = None
    bank_transaction_id: Optional[str] = None
    lineage_id: Optional[str] = None
    exception_type: str
    severity: str
    expected_amount: float
    actual_amount: float
    difference: float
    confidence: float
    ai_explanation: Optional[Dict[str, Any]] = None
    status: str
    recommended_action: Optional[str] = None
    resolution_notes: Optional[str] = None
    resolved_by: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class ExceptionActionRequest(BaseModel):
    action: str
    notes: Optional[str] = None
    actor: str = "FINANCE_OPS"

# Reconciliation Result Schemas
class ReconciliationResultResponse(BaseModel):
    id: int
    recon_batch_id: Optional[str] = None
    lineage_id: Optional[str] = None
    settlement_id: Optional[str] = None
    bank_transaction_id: Optional[str] = None
    match_status: str
    match_score: float
    matching_method: str
    expected_amount: float
    actual_amount: float
    difference: float
    reason: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# Overview Metrics Schema
class OverviewMetrics(BaseModel):
    total_transactions: int
    matched_count: int
    exceptions_count: int
    match_rate: float
    expected_settlement_total: float
    actual_bank_credit_total: float
    unexplained_difference: float
    auto_resolved_count: int
    human_review_required: int
    exception_breakdown: Dict[str, int]
    severity_breakdown: Dict[str, int]
    why_breakdown: Dict[str, Any]

# Benchmark & Evaluation Schemas
class BenchmarkMetrics(BaseModel):
    dataset_name: str
    total_records: int
    processed_records: int
    processing_time_seconds: float
    throughput_records_per_sec: float
    match_rate_pct: float
    precision_pct: float
    recall_pct: float
    false_match_rate_pct: float
    auto_resolution_rate_pct: float
    total_exceptions: int
    auto_resolved_exceptions: int
    human_triage_exceptions: int
    ground_truth_accuracy_pct: float

# Cash Forecast Schemas
class DailyForecast(BaseModel):
    date: str
    projected_balance: float
    expected_inflow: float
    expected_outflow: float
    lower_bound: float
    upper_bound: float

class ScenarioOutlook(BaseModel):
    scenario_name: str
    projected_30d: float
    growth_rate_pct: float
    risk_level: str
    commentary: str
    is_threshold_breached: bool = False
    breach_day: Optional[int] = None
    daily_curve: List[DailyForecast]

class CashForecastResponse(BaseModel):
    current_cash: float
    pending_settlements_inflow: float
    expected_receivables_7d: float
    expected_refunds_outflow_7d: float
    recurring_expenses_7d: float
    projected_7d: float
    projected_30d: float
    confidence_score: float
    safety_threshold: float = 1200000.0
    ai_commentary: str
    daily_forecasts: List[DailyForecast]
    scenarios: Dict[str, ScenarioOutlook] = Field(default_factory=dict)

# Copilot Schemas
class CopilotChatRequest(BaseModel):
    query: str
    context_filters: Optional[Dict[str, Any]] = None

class CopilotChatResponse(BaseModel):
    answer: str
    confidence: float
    sources: List[str]
    suggested_actions: List[str]
    data_payload: Optional[Dict[str, Any]] = None

# AI Daily Close & Money Trail Schemas
class MoneyTrailNode(BaseModel):
    id: str
    step: str
    title: str
    subtitle: str
    amount: float
    status: str
    badge_label: str
    metadata: Dict[str, Any] = Field(default_factory=dict)

class MoneyTrailResponse(BaseModel):
    settlement_id: str
    lineage_id: str
    utr: str
    status: str
    gross_amount: float
    fees: float
    tax: float
    refunds: float
    expected_net: float
    actual_bank_credit: float
    variance: float
    payment_count: int
    nodes: List[MoneyTrailNode]
    evidence_checklist: List[EvidenceItem]
    ai_verdict: str

class RiskBreakdownCategory(BaseModel):
    category: str
    label: str = Field(default="")
    amount: float
    count: int
    impact_pct: float
    description: str
    representative_settlement_id: Optional[str] = None

class CriticalBlocker(BaseModel):
    exception_id: str
    settlement_id: Optional[str] = None
    type: str
    amount_at_risk: float
    confidence: float
    summary: str
    recommendation: str

class CloseRouteOption(BaseModel):
    option_id: str
    title: str
    description: str
    exceptions_to_resolve: List[str]
    risk_cleared_amount: float
    resulting_readiness_pct: float
    resulting_close_decision: str
    is_fully_closed: bool

class ReliabilityMetrics(BaseModel):
    precision_pct: float
    recall_pct: float
    false_match_rate_pct: float
    deterministic_decisions_pct: float
    ai_assisted_decisions_pct: float
    human_escalations_pct: float
    total_reconciled: int
    audit_trail_integrity: str

class DailyCloseResponse(BaseModel):
    cycle_date: str
    payments_processed_count: int
    payments_processed_gross: float
    expected_settlement_total: float
    bank_received_total: float
    verified_cash_total: float
    cash_at_risk_total: float
    match_rate_pct: float
    total_exceptions_count: int
    critical_exceptions_count: int
    close_readiness_pct: float
    close_decision: str
    close_decision_summary: str
    risk_breakdown: List[RiskBreakdownCategory]
    critical_blockers: List[CriticalBlocker]
    fastest_routes_to_close: List[CloseRouteOption] = Field(default_factory=list)
    top_critical_trail: Optional[MoneyTrailResponse] = None
    ai_close_commentary: str

# What-If Simulator & Investigation Types
class FinancialStateSnapshot(BaseModel):
    verified_cash: float
    cash_at_risk: float
    close_readiness_pct: float
    open_exceptions_count: int
    close_decision: str

class WhatIfSimulationResponse(BaseModel):
    target_exception_id: str
    target_settlement_id: Optional[str] = None
    exception_amount: float
    exception_type: str
    before_state: FinancialStateSnapshot
    after_state: FinancialStateSnapshot
    risk_reduction_amount: float
    risk_reduction_pct: float
    readiness_delta_pct: float
    is_close_unlocked: bool
    ai_impact_narrative: str

class SQLAuditQuery(BaseModel):
    table_name: str
    query_string: str
    filter_params: Dict[str, Any]
    matched_rows_count: int
    raw_rows: List[Dict[str, Any]]

class InvestigationStep(BaseModel):
    step_number: int
    name: str
    status: str
    timestamp: str
    findings: str
    sql_audit: Optional[SQLAuditQuery] = None
    raw_data: Optional[Dict[str, Any]] = None

class InvestigationTraceResponse(BaseModel):
    exception_id: str
    settlement_id: Optional[str] = None
    lineage_id: Optional[str] = None
    variance_amount: float
    confidence_score: float
    investigation_steps: List[InvestigationStep]
    variance_attribution: Dict[str, float]
    verdict: str
    recommended_action: str
    can_auto_resolve: bool

# Live Event Stream Schemas
class LiveWebhookEvent(BaseModel):
    event_id: str
    event_type: str
    entity_id: str
    amount: float
    timestamp: str
    narration: str
    status: str
    processing_time_ms: float
    cash_impact: float

# Audit Replay Schemas
class AuditReplayEvent(BaseModel):
    step_index: int
    timestamp: str
    stage: str
    actor: str
    description: str
    state_delta: Dict[str, Any]

class AuditReplayResponse(BaseModel):
    exception_id: str
    lineage_id: str
    status: str
    total_lifecycle_seconds: float
    events: List[AuditReplayEvent]

# Phase 4: Accuracy Stress Test, Calculation Proof, Challenge & Decision Gate Schemas
class AdversarialTestCase(BaseModel):
    test_id: str
    name: str
    description: str
    adversarial_condition: str
    status: str
    execution_time_ms: float
    safeguard_enforced: str

class AccuracyStressTestResponse(BaseModel):
    dataset_records_count: int
    processing_time_seconds: float
    throughput_records_per_sec: float
    precision_pct: float
    recall_pct: float
    false_match_rate_pct: float
    false_negative_rate_pct: float
    auto_matched_count: int
    ai_assisted_count: int
    human_escalation_count: int
    contradiction_blocks_count: int
    ambiguous_candidate_blocks_count: int
    adversarial_tests: List[AdversarialTestCase]
    comparison_matrix: Dict[str, Any] = Field(default_factory=dict)
    safety_policy_verdict: str

class CalculationProofItem(BaseModel):
    line_item: str
    operator: str
    amount: float
    explanation: str

class CalculationProofResponse(BaseModel):
    settlement_id: str
    lineage_id: str
    gross_amount: float
    refunds_amount: float
    mdr_fee: float
    gst_tax: float
    expected_net_settlement: float
    actual_bank_credit: float
    variance: float
    attribution_reason: str
    proof_steps: List[CalculationProofItem]
    formula_string: str

class CandidateMatch(BaseModel):
    candidate_id: str
    score: float
    matching_method: str
    reference: str
    amount: float
    date_offset_days: int

class ChallengeControllerResponse(BaseModel):
    target_result_id: int
    settlement_id: str
    primary_candidate: CandidateMatch
    alternative_candidates: List[CandidateMatch]
    decision_margin_pct: float
    is_ambiguous: bool
    original_decision: str
    adversarial_verdict: str
    challenge_status: str

class DecisionGateItem(BaseModel):
    gate_name: str
    status: str # VERIFIED, WARNING, DISCREPANCY, CLEARED
    detail: str

class DecisionGateResponse(BaseModel):
    result_id: int
    settlement_id: Optional[str] = None
    bank_transaction_id: Optional[str] = None
    lineage_id: str
    match_status: str
    match_score: float
    matching_method: str
    decision_verdict: str
    gates: List[DecisionGateItem]
    safety_policy: str
