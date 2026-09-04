const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export interface OverviewMetrics {
  total_transactions: number;
  matched_count: number;
  exceptions_count: number;
  match_rate: number;
  expected_settlement_total: number;
  actual_bank_credit_total: number;
  unexplained_difference: number;
  auto_resolved_count: number;
  human_review_required: number;
  exception_breakdown: Record<string, number>;
  severity_breakdown: Record<string, number>;
  why_breakdown: {
    total_unreconciled: number;
    causes: Record<string, number>;
    top_cause: string;
    most_likely_source: string;
  };
}

export interface BenchmarkMetrics {
  dataset_name: string;
  total_records: number;
  processed_records: number;
  processing_time_seconds: number;
  throughput_records_per_sec: number;
  match_rate_pct: number;
  precision_pct: number;
  recall_pct: number;
  false_match_rate_pct: number;
  auto_resolution_rate_pct: number;
  total_exceptions: number;
  auto_resolved_exceptions: number;
  human_triage_exceptions: number;
  ground_truth_accuracy_pct: number;
}

export interface EvidenceItem {
  factor: string;
  status: "VERIFIED" | "DISCREPANCY" | "WARNING" | "INFO";
  detail: string;
}

export interface AIExplanation {
  summary: string;
  likely_cause: string;
  confidence: number;
  evidence: EvidenceItem[];
  recommended_action: string;
  auto_resolvable: boolean;
}

export interface ExceptionItem {
  id: string;
  recon_result_id?: number;
  settlement_id?: string;
  bank_transaction_id?: string;
  lineage_id?: string;
  exception_type: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  expected_amount: number;
  actual_amount: number;
  difference: number;
  confidence: number;
  ai_explanation?: AIExplanation;
  status: "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "REJECTED";
  recommended_action?: string;
  resolution_notes?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at?: string;
}

export interface ReconciliationItem {
  id: number;
  recon_batch_id?: string;
  lineage_id?: string;
  settlement_id?: string;
  bank_transaction_id?: string;
  match_status: "MATCHED" | "PARTIAL" | "MISMATCH" | "UNRESOLVED" | "AUTO_RESOLVED";
  match_score: number;
  matching_method: string;
  expected_amount: number;
  actual_amount: number;
  difference: number;
  reason?: string;
  created_at?: string;
}

export interface DailyForecast {
  date: string;
  projected_balance: number;
  expected_inflow: number;
  expected_outflow: number;
  lower_bound: number;
  upper_bound: number;
}

export interface ScenarioOutlook {
  scenario_name: string;
  projected_30d: number;
  growth_rate_pct: number;
  risk_level: string;
  commentary: string;
  is_threshold_breached: boolean;
  breach_day?: number;
  daily_curve: DailyForecast[];
}

export interface CashForecast {
  current_cash: number;
  pending_settlements_inflow: number;
  expected_receivables_7d: number;
  expected_refunds_outflow_7d: number;
  recurring_expenses_7d: number;
  projected_7d: number;
  projected_30d: number;
  confidence_score: number;
  safety_threshold: number;
  ai_commentary: string;
  daily_forecasts: DailyForecast[];
  scenarios: Record<string, ScenarioOutlook>;
}

export interface CopilotResponse {
  answer: string;
  confidence: number;
  sources: string[];
  suggested_actions: string[];
  data_payload?: Record<string, any>;
}

export interface MoneyTrailNode {
  id: string;
  step: "CUSTOMER" | "PAYMENT" | "SETTLEMENT" | "BANK" | "LEDGER";
  title: string;
  subtitle: string;
  amount: number;
  status: "VERIFIED" | "MISMATCH" | "UNRESOLVED" | "WARNING";
  badge_label: string;
  metadata?: Record<string, any>;
}

export interface MoneyTrailResponse {
  settlement_id: string;
  lineage_id: string;
  utr: string;
  status: string;
  gross_amount: number;
  fees: number;
  tax: number;
  refunds: number;
  expected_net: number;
  actual_bank_credit: number;
  variance: number;
  payment_count: number;
  nodes: MoneyTrailNode[];
  evidence_checklist: EvidenceItem[];
  ai_verdict: string;
}

export interface RiskBreakdownCategory {
  category: string;
  label: string;
  amount: number;
  count: number;
  impact_pct: number;
  description: string;
  representative_settlement_id?: string;
}

export interface CriticalBlocker {
  exception_id: string;
  settlement_id?: string;
  type: string;
  amount_at_risk: number;
  confidence: number;
  summary: string;
  recommendation: string;
}

export interface CloseRouteOption {
  option_id: string;
  title: string;
  description: string;
  exceptions_to_resolve: string[];
  risk_cleared_amount: number;
  resulting_readiness_pct: number;
  resulting_close_decision: string;
  is_fully_closed: boolean;
}

export interface ReliabilityMetrics {
  precision_pct: number;
  recall_pct: number;
  false_match_rate_pct: number;
  deterministic_decisions_pct: number;
  ai_assisted_decisions_pct: number;
  human_escalations_pct: number;
  total_reconciled: number;
  audit_trail_integrity: string;
}

export interface DailyCloseResponse {
  cycle_date: string;
  payments_processed_count: number;
  payments_processed_gross: number;
  expected_settlement_total: number;
  bank_received_total: number;
  verified_cash_total: number;
  cash_at_risk_total: number;
  match_rate_pct: number;
  total_exceptions_count: number;
  critical_exceptions_count: number;
  close_readiness_pct: number;
  close_decision: "CANNOT_CLOSE" | "READY_TO_CLOSE";
  close_decision_summary: string;
  risk_breakdown: RiskBreakdownCategory[];
  critical_blockers: CriticalBlocker[];
  fastest_routes_to_close: CloseRouteOption[];
  top_critical_trail?: MoneyTrailResponse;
  ai_close_commentary: string;
}

export interface FinancialStateSnapshot {
  verified_cash: number;
  cash_at_risk: number;
  close_readiness_pct: number;
  open_exceptions_count: number;
  close_decision: string;
}

export interface WhatIfSimulationResponse {
  target_exception_id: string;
  target_settlement_id?: string;
  exception_amount: number;
  exception_type: string;
  before_state: FinancialStateSnapshot;
  after_state: FinancialStateSnapshot;
  risk_reduction_amount: number;
  risk_reduction_pct: number;
  readiness_delta_pct: number;
  is_close_unlocked: boolean;
  ai_impact_narrative: string;
}

export interface SQLAuditQuery {
  table_name: string;
  query_string: string;
  filter_params: Record<string, any>;
  matched_rows_count: number;
  raw_rows: Record<string, any>[];
}

export interface InvestigationStep {
  step_number: number;
  name: string;
  status: "SUCCESS" | "WARNING" | "DISCREPANCY" | "INFO";
  timestamp: string;
  findings: string;
  sql_audit?: SQLAuditQuery;
  raw_data?: Record<string, any>;
}

export interface InvestigationTraceResponse {
  exception_id: string;
  settlement_id?: string;
  lineage_id?: string;
  variance_amount: number;
  confidence_score: number;
  investigation_steps: InvestigationStep[];
  variance_attribution: Record<string, number>;
  verdict: string;
  recommended_action: string;
  can_auto_resolve: boolean;
}

export interface LiveWebhookEvent {
  event_id: string;
  event_type: "payment.captured" | "settlement.processed" | "refund.created";
  entity_id: string;
  amount: number;
  timestamp: string;
  narration: string;
  status: "RECEIVED" | "PROCESSED" | "EXCEPTION_FLAGGED" | "RECONCILED";
  processing_time_ms: number;
  cash_impact: number;
}

export interface AuditReplayEvent {
  step_index: number;
  timestamp: string;
  stage: string;
  actor: string;
  description: string;
  state_delta: Record<string, any>;
}

export interface AuditReplayResponse {
  exception_id: string;
  lineage_id: string;
  status: string;
  total_lifecycle_seconds: number;
  events: AuditReplayEvent[];
}

export interface AdversarialTestCase {
  test_id: string;
  name: string;
  description: string;
  adversarial_condition: string;
  status: "PASS" | "BLOCKED" | "ESCALATED";
  execution_time_ms: number;
  safeguard_enforced: string;
}

export interface EngineComparison {
  name: string;
  precision_pct: number;
  recall_pct: number;
  false_match_rate_pct: number;
  auto_match_pct: number;
  human_review_pct: number;
  safeguard_policy: string;
}

export interface AccuracyStressTestResponse {
  dataset_records_count: number;
  processing_time_seconds: number;
  throughput_records_per_sec: number;
  precision_pct: number;
  recall_pct: number;
  false_match_rate_pct: number;
  false_negative_rate_pct: number;
  auto_matched_count: number;
  ai_assisted_count: number;
  human_escalation_count: number;
  contradiction_blocks_count: number;
  ambiguous_candidate_blocks_count: number;
  adversarial_tests: AdversarialTestCase[];
  comparison_matrix: {
    baseline_v1: EngineComparison;
    safe_engine_v2: EngineComparison;
    key_takeaway: string;
  };
  safety_policy_verdict: string;
}

export interface CalculationProofItem {
  line_item: string;
  operator: "ADD" | "SUBTRACT" | "EQUALS" | "VARIANCE";
  amount: number;
  explanation: string;
}

export interface CalculationProofResponse {
  settlement_id: string;
  lineage_id: string;
  gross_amount: number;
  refunds_amount: number;
  mdr_fee: number;
  gst_tax: number;
  expected_net_settlement: number;
  actual_bank_credit: number;
  variance: number;
  attribution_reason: string;
  proof_steps: CalculationProofItem[];
  formula_string: string;
}

export interface CandidateMatch {
  candidate_id: string;
  score: number;
  matching_method: string;
  reference: string;
  amount: number;
  date_offset_days: number;
}

export interface ChallengeControllerResponse {
  target_result_id: number;
  settlement_id: string;
  primary_candidate: CandidateMatch;
  alternative_candidates: CandidateMatch[];
  decision_margin_pct: number;
  is_ambiguous: boolean;
  original_decision: string;
  adversarial_verdict: string;
  challenge_status: "CONFIRMED_SECURE" | "DOWNGRADED_TO_REVIEW";
}

export interface DecisionGateItem {
  gate_name: string;
  status: "VERIFIED" | "WARNING" | "DISCREPANCY" | "CLEARED";
  detail: string;
}

export interface DecisionGateResponse {
  result_id: number;
  settlement_id?: string;
  bank_transaction_id?: string;
  lineage_id: string;
  match_status: string;
  match_score: number;
  matching_method: string;
  decision_verdict: string;
  gates: DecisionGateItem[];
  safety_policy: string;
}

export const api = {
  async getOverview(): Promise<OverviewMetrics> {
    const res = await fetch(`${API_BASE}/api/overview`);
    if (!res.ok) throw new Error("Failed to fetch overview metrics");
    return res.json();
  },

  async getBenchmark(): Promise<BenchmarkMetrics> {
    const res = await fetch(`${API_BASE}/api/benchmark`);
    if (!res.ok) throw new Error("Failed to fetch benchmark metrics");
    return res.json();
  },

  async getExceptions(params?: { severity?: string; status?: string; type?: string }): Promise<ExceptionItem[]> {
    const query = new URLSearchParams();
    if (params?.severity) query.append("severity", params.severity);
    if (params?.status) query.append("status", params.status);
    if (params?.type) query.append("exception_type", params.type);
    
    const res = await fetch(`${API_BASE}/api/exceptions?${query.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch exceptions");
    return res.json();
  },

  async getExceptionDetail(id: string): Promise<ExceptionItem> {
    const res = await fetch(`${API_BASE}/api/exceptions/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch exception ${id}`);
    return res.json();
  },

  async takeExceptionAction(id: string, action: string, notes?: string): Promise<ExceptionItem> {
    const res = await fetch(`${API_BASE}/api/exceptions/${id}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, notes, actor: "FINANCE_OPS" })
    });
    if (!res.ok) throw new Error(`Failed to update exception ${id}`);
    return res.json();
  },

  async getReconciliations(status?: string): Promise<ReconciliationItem[]> {
    const query = status ? `?status=${status}` : "";
    const res = await fetch(`${API_BASE}/api/reconcile/results${query}`);
    if (!res.ok) throw new Error("Failed to fetch reconciliation records");
    return res.json();
  },

  async runReconciliation(): Promise<any> {
    const res = await fetch(`${API_BASE}/api/reconcile/run`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to execute reconciliation");
    return res.json();
  },

  async getForecast(): Promise<CashForecast> {
    const res = await fetch(`${API_BASE}/api/forecast`);
    if (!res.ok) throw new Error("Failed to fetch cash forecast");
    return res.json();
  },

  async askCopilot(query: string): Promise<CopilotResponse> {
    const res = await fetch(`${API_BASE}/api/copilot/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });
    if (!res.ok) throw new Error("Failed to fetch copilot response");
    return res.json();
  },

  async seedDataset(count: number = 500): Promise<any> {
    const res = await fetch(`${API_BASE}/api/seed?num_payments=${count}`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to seed synthetic dataset");
    return res.json();
  },

  async getDailyClose(): Promise<DailyCloseResponse> {
    const res = await fetch(`${API_BASE}/api/daily-close/status`);
    if (!res.ok) throw new Error("Failed to fetch daily close status");
    return res.json();
  },

  async runDailyClose(): Promise<DailyCloseResponse> {
    const res = await fetch(`${API_BASE}/api/daily-close/run`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to run daily close");
    return res.json();
  },

  async getMoneyTrail(settlementId: string): Promise<MoneyTrailResponse> {
    const res = await fetch(`${API_BASE}/api/money-trail/${settlementId}`);
    if (!res.ok) throw new Error(`Failed to fetch money trail for ${settlementId}`);
    return res.json();
  },

  async simulateWhatIf(exceptionId: string): Promise<WhatIfSimulationResponse> {
    const res = await fetch(`${API_BASE}/api/what-if/simulate?exception_id=${exceptionId}`, { method: "POST" });
    if (!res.ok) throw new Error(`Failed to simulate what-if for ${exceptionId}`);
    return res.json();
  },

  async getInvestigationTrace(exceptionId: string): Promise<InvestigationTraceResponse> {
    const res = await fetch(`${API_BASE}/api/investigate/${exceptionId}`);
    if (!res.ok) throw new Error(`Failed to investigate ${exceptionId}`);
    return res.json();
  },

  async getCloseRoutes(): Promise<CloseRouteOption[]> {
    const res = await fetch(`${API_BASE}/api/close-routes`);
    if (!res.ok) throw new Error("Failed to fetch close routes");
    return res.json();
  },

  async getAuditReplay(exceptionId: string): Promise<AuditReplayResponse> {
    const res = await fetch(`${API_BASE}/api/audit-replay/${exceptionId}`);
    if (!res.ok) throw new Error(`Failed to fetch audit replay for ${exceptionId}`);
    return res.json();
  },

  async getReliabilityMatrix(): Promise<ReliabilityMetrics> {
    const res = await fetch(`${API_BASE}/api/reliability-matrix`);
    if (!res.ok) throw new Error("Failed to fetch reliability matrix");
    return res.json();
  },

  async runAccuracyStressTest(numRecords: number = 5000): Promise<AccuracyStressTestResponse> {
    const res = await fetch(`${API_BASE}/api/accuracy/stress-test?num_records=${numRecords}`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to run accuracy stress test");
    return res.json();
  },

  async getCalculationProof(settlementId: string): Promise<CalculationProofResponse> {
    const res = await fetch(`${API_BASE}/api/calculation-proof/${settlementId}`);
    if (!res.ok) throw new Error(`Failed to fetch calculation proof for ${settlementId}`);
    return res.json();
  },

  async challengeDecision(resultId: number): Promise<ChallengeControllerResponse> {
    const res = await fetch(`${API_BASE}/api/recon/challenge/${resultId}`, { method: "POST" });
    if (!res.ok) throw new Error(`Failed to challenge decision ${resultId}`);
    return res.json();
  },

  async getDecisionGate(resultId: number): Promise<DecisionGateResponse> {
    const res = await fetch(`${API_BASE}/api/recon/decision-gate/${resultId}`);
    if (!res.ok) throw new Error(`Failed to fetch decision gate for ${resultId}`);
    return res.json();
  },

  async simulateIncomingEvent(eventType?: string): Promise<LiveWebhookEvent> {
    const query = eventType ? `?event_type=${eventType}` : "";
    const res = await fetch(`${API_BASE}/api/events/simulate-incoming${query}`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to simulate incoming webhook event");
    return res.json();
  },

  async injectAnomaly(amount: number = 26400.0): Promise<any> {
    const res = await fetch(`${API_BASE}/api/events/inject-anomaly?amount=${amount}`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to inject live anomaly");
    return res.json();
  },

  async getRecentEvents(): Promise<LiveWebhookEvent[]> {
    const res = await fetch(`${API_BASE}/api/events/recent`);
    if (!res.ok) throw new Error("Failed to fetch recent events");
    return res.json();
  }
};
