"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { WhyModal } from "@/components/WhyModal";
import { BenchmarkModal } from "@/components/BenchmarkModal";
import { ExceptionDrawer } from "@/components/ExceptionDrawer";
import { DailyCloseModal } from "@/components/DailyCloseModal";
import { MoneyTrailModal } from "@/components/MoneyTrailModal";
import { WhatIfModal } from "@/components/WhatIfModal";
import { InvestigatorModal } from "@/components/InvestigatorModal";
import { AuditReplayModal } from "@/components/AuditReplayModal";
import { AccuracySafetyModal } from "@/components/AccuracySafetyModal";
import { DecisionGateModal } from "@/components/DecisionGateModal";
import {
  api,
  OverviewMetrics,
  ExceptionItem,
  DailyCloseResponse,
  formatINR
} from "@/lib/api";
import {
  CheckCircle2,
  Clock,
  Eye,
  Zap,
  History,
  ShieldCheck,
  Check,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Scale,
  FileCheck2,
  Building2,
  Search,
  Activity,
  Layers,
  TrendingUp,
  X
} from "lucide-react";

export default function MainPage() {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [dailyClose, setDailyClose] = useState<DailyCloseResponse | null>(null);
  const [exceptions, setExceptions] = useState<ExceptionItem[]>([]);
  const [selectedException, setSelectedException] = useState<ExceptionItem | null>(null);
  const [searchVal, setSearchVal] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [trailSettlementId, setTrailSettlementId] = useState<string | null>(null);
  const [whatIfExId, setWhatIfExId] = useState<string | null>(null);
  const [investigateExId, setInvestigateExId] = useState<string | null>(null);
  const [replayExId, setReplayExId] = useState<string | null>(null);
  const [selectedGateResultId, setSelectedGateResultId] = useState<number | null>(null);

  const [isWhyOpen, setIsWhyOpen] = useState(false);
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState(false);
  const [isDailyCloseOpen, setIsDailyCloseOpen] = useState(false);
  const [isTrailOpen, setIsTrailOpen] = useState(false);
  const [isWhatIfOpen, setIsWhatIfOpen] = useState(false);
  const [isInvestigatorOpen, setIsInvestigatorOpen] = useState(false);
  const [isReplayOpen, setIsReplayOpen] = useState(false);
  const [isAccuracyOpen, setIsAccuracyOpen] = useState(false);
  const [isGateOpen, setIsGateOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [overviewData, closeData, exceptionsData] = await Promise.all([
        api.getOverview(),
        api.getDailyClose(),
        api.getExceptions()
      ]);
      setMetrics(overviewData);
      setDailyClose(closeData);
      setExceptions(exceptionsData);
    } catch (err) {
      console.error("Failed to load operations data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleApproveException = async (ex: ExceptionItem) => {
    try {
      setActionLoadingId(ex.id);
      await api.takeExceptionAction(
        ex.id,
        "APPROVE_ADJUSTMENT",
        `Approved by Operations Controller. Booked to Gateway Variance Account.`
      );
      showToast(`Settlement ${ex.id} (${ex.settlement_id || "Direct Credit"}) approved and moved to Approved Settlements register.`);
      await loadData();
    } catch (err) {
      console.error(err);
      showToast(`Failed to approve exception ${ex.id}.`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleHoldException = async (ex: ExceptionItem) => {
    try {
      setActionLoadingId(ex.id);
      await api.takeExceptionAction(
        ex.id,
        "MARK_DISPUTED",
        `Flagged for Bank Clearing Dispute Inquiry with Axis Bank.`
      );
      showToast(`Settlement ${ex.id} placed on Dispute Hold.`);
      await loadData();
    } catch (err) {
      console.error(err);
      showToast(`Failed to hold exception ${ex.id}.`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSimulateWebhook = async (type: string) => {
    try {
      await api.simulateIncomingEvent(type);
      showToast(`Live clearing webhook (${type}) ingested.`);
      await loadData();
    } catch {
      // fallback
    }
  };

  const handleSimulateDelay = async () => {
    try {
      await api.injectAnomaly(26400.0);
      showToast("Delayed settlement batch of ₹26,400.00 injected into pending queue.");
      await loadData();
    } catch {
      // fallback
    }
  };

  // Partition exceptions into Pending Actions vs Approved Settlements
  const pendingExceptions = exceptions.filter(
    (e) => e.status === "OPEN" || e.status === "UNDER_REVIEW"
  ).filter((e) => {
    const matchesSev = filterSeverity === "ALL" || e.severity === filterSeverity;
    const matchesSearch =
      !searchVal ||
      e.id.toLowerCase().includes(searchVal.toLowerCase()) ||
      (e.settlement_id && e.settlement_id.toLowerCase().includes(searchVal.toLowerCase())) ||
      (e.lineage_id && e.lineage_id.toLowerCase().includes(searchVal.toLowerCase())) ||
      e.exception_type.toLowerCase().includes(searchVal.toLowerCase());
    return matchesSev && matchesSearch;
  });

  const approvedSettlements = exceptions.filter(
    (e) => e.status === "RESOLVED" || e.status === "REJECTED"
  ).filter((e) => {
    const matchesSearch =
      !searchVal ||
      e.id.toLowerCase().includes(searchVal.toLowerCase()) ||
      (e.settlement_id && e.settlement_id.toLowerCase().includes(searchVal.toLowerCase())) ||
      (e.lineage_id && e.lineage_id.toLowerCase().includes(searchVal.toLowerCase()));
    return matchesSearch;
  });

  // Calculate circular progress for readiness ring
  const readinessPct = dailyClose?.close_readiness_pct ?? 91.6;
  const strokeDashoffset = 326.7 - (326.7 * readinessPct) / 100;

  return (
    <div className="min-h-screen bg-[#F5F6F3] flex flex-col lg:flex-row font-sans pb-20 lg:pb-0">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs shadow-lg border border-slate-700 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Unified Professional Sidebar (Desktop) */}
      <Sidebar
        exceptionCount={pendingExceptions.length}
        onRefreshData={loadData}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full lg:max-w-[1180px] xl:max-w-[1240px]">
        
        {/* Mobile Navbar (< 1024px) */}
        <Navbar
          onReconcileTrigger={loadData}
          onOpenBenchmark={() => setIsBenchmarkOpen(true)}
          onOpenDailyClose={() => setIsDailyCloseOpen(true)}
          onOpenAccuracyCenter={() => setIsAccuracyOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">

          {/* Institutional Header Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-heading font-bold text-xl sm:text-2xl text-slate-900 tracking-tight flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-[#3730A3] stroke-[1.5]" />
                  <span>Financial Operations Control</span>
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    Razorpay Production Gateway
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#F5F6F3] text-slate-700 border border-[#E5E7EB] font-mono">
                    Nodal Escrow: Axis Bank (*7849)
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#F5F6F3] text-slate-700 border border-[#E5E7EB]">
                    T+1 RBI Settlement Cycle
                  </span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2">
                <button
                  onClick={loadData}
                  disabled={loading}
                  className="min-h-[42px] px-4 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-[#F5F6F3] text-slate-700 border border-[#E5E7EB] transition-colors cursor-pointer flex items-center space-x-2 shadow-xs"
                  title="Refresh Gateway & Bank Feeds"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${loading ? "animate-spin" : ""}`} />
                  <span>Refresh Feeds</span>
                </button>
              </div>
            </div>

            {/* Global Search Bar */}
            <div className="pt-2 border-t border-[#E5E7EB]">
              <div className="relative max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 stroke-[1.5]" />
                <input
                  type="text"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="Search settlement batches, bank UTRs, exceptions…"
                  className="w-full pl-9 pr-4 min-h-[40px] text-xs bg-[#F5F6F3] border border-[#E5E7EB] rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#3730A3]"
                />
              </div>
            </div>
          </div>

          {/* 4 Primary Operational KPIs */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Key operational metrics">
            
            {/* KPI 1: Volume */}
            <div className="bg-white border border-[#E5E7EB] border-t-[3px] border-t-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-[11px] font-mono uppercase text-slate-500 font-semibold tracking-wider">
                Total Volume Processed
              </span>
              <p className="text-2xl font-bold font-heading text-slate-900 tabular-nums">
                {dailyClose ? formatINR(dailyClose.payments_processed_gross, true) : "₹22.03L"}
              </p>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>{dailyClose?.payments_processed_count || 0} gateway payments</span>
                <Link href="/dataset" className="text-[#3730A3] font-semibold hover:underline">
                  Feeds →
                </Link>
              </div>
            </div>

            {/* KPI 2: Match Rate */}
            <div className="bg-white border border-[#E5E7EB] border-t-[3px] border-t-emerald-600 rounded-2xl p-5 space-y-2">
              <span className="text-[11px] font-mono uppercase text-slate-500 font-semibold tracking-wider">
                Reconciliation Rate
              </span>
              <p className="text-2xl font-bold font-heading text-[#065F46] tabular-nums">
                {metrics ? `${metrics.match_rate}%` : "88.65%"}
              </p>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span className="inline-flex items-center gap-1 font-medium text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  {metrics?.matched_count || 0} batches matched
                </span>
                <button
                  onClick={() => setIsBenchmarkOpen(true)}
                  className="text-[#3730A3] font-semibold hover:underline cursor-pointer border-0 bg-transparent p-0 text-xs"
                >
                  Audit →
                </button>
              </div>
            </div>

            {/* KPI 3: Cash at Risk */}
            <div className="bg-white border border-[#E5E7EB] border-t-[3px] border-t-amber-500 rounded-2xl p-5 space-y-2">
              <span className="text-[11px] font-mono uppercase text-slate-500 font-semibold tracking-wider">
                Pending Settlement Exposure
              </span>
              <p className="text-2xl font-bold font-heading text-amber-900 tabular-nums">
                {dailyClose ? formatINR(dailyClose.cash_at_risk_total) : "₹0.00"}
              </p>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>{pendingExceptions.length} items requiring action</span>
                <button
                  onClick={() => setIsWhyOpen(true)}
                  className="text-[#3730A3] font-semibold hover:underline cursor-pointer border-0 bg-transparent p-0 text-xs"
                >
                  Variance →
                </button>
              </div>
            </div>

            {/* KPI 4: Unreconciled Variance */}
            <div className="bg-white border border-[#E5E7EB] border-t-[3px] border-t-rose-600 rounded-2xl p-5 space-y-2">
              <span className="text-[11px] font-mono uppercase text-slate-500 font-semibold tracking-wider">
                Unreconciled Variance
              </span>
              <p className="text-2xl font-bold font-heading text-rose-700 tabular-nums">
                {metrics ? formatINR(metrics.unexplained_difference) : "₹0.00"}
              </p>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Axis Bank Nodal (*7849)</span>
                <button
                  onClick={() => setIsWhyOpen(true)}
                  className="text-[#3730A3] font-semibold hover:underline cursor-pointer border-0 bg-transparent p-0 text-xs"
                >
                  Root Cause →
                </button>
              </div>
            </div>

          </section>

          {/* Main Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left 2 Columns: Action Required + Approved Settlements */}
            <div className="lg:col-span-2 space-y-6">

              {/* SECTION 1: Action Required (Pending Exceptions) */}
              <section className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-heading font-bold text-base text-slate-900 tracking-tight">
                        Action Required · Open Exceptions
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {pendingExceptions.length} Pending
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Automated reconciliation variances requiring controller approval or bank inquiry
                    </p>
                  </div>

                  {/* Severity Filter */}
                  <div className="flex items-center gap-1.5">
                    {["ALL", "HIGH", "MEDIUM"].map((sev) => (
                      <button
                        key={sev}
                        onClick={() => setFilterSeverity(sev)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          filterSeverity === sev
                            ? "bg-slate-900 text-white"
                            : "bg-[#F5F6F3] text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {sev === "ALL" ? "All" : sev}
                      </button>
                    ))}
                  </div>
                </div>

                {pendingExceptions.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto stroke-[1.5]" />
                    <p className="font-semibold text-slate-800 text-sm">All Settlement Batches Reconciled</p>
                    <p className="text-slate-500 max-w-sm mx-auto">
                      Zero open exceptions require controller action. You are clear to execute daily period close.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#E5E7EB]">
                    {pendingExceptions.map((ex) => (
                      <div key={ex.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F5F6F3]/50 transition-colors rounded-xl px-2">
                        
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-xs text-slate-900">{ex.id}</span>
                            {ex.lineage_id && (
                              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#F5F6F3] text-slate-600 border border-[#E5E7EB]">
                                {ex.lineage_id}
                              </span>
                            )}
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-indigo-50 text-[#3730A3] border border-indigo-100">
                              {ex.exception_type === "MISSING_SETTLEMENT"
                                ? "Missing Bank Credit · T+2 Lag"
                                : ex.exception_type === "AMOUNT_MISMATCH"
                                ? "Gateway Fee / GST Variance"
                                : ex.exception_type === "UNKNOWN_BANK_ENTRY"
                                ? "Unmatched Direct Wire"
                                : ex.exception_type.replace(/_/g, " ")}
                            </span>
                            {ex.severity === "HIGH" && (
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                                High Risk
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed">
                            {ex.ai_explanation?.likely_cause ||
                              (ex.settlement_id
                                ? `Settlement ${ex.settlement_id} expected net ₹${ex.expected_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })} has unreconciled variance.`
                                : `Variance of ₹${ex.difference.toLocaleString("en-IN", { minimumFractionDigits: 2 })} pending bank verification.`)}
                          </p>

                          <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                            <span>Expected: <strong className="text-slate-800">₹{ex.expected_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong></span>
                            <span>Bank Credit: <strong className="text-slate-800">₹{ex.actual_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong></span>
                          </div>
                        </div>

                        {/* Financial Exposure & Actions */}
                        <div className="flex items-center gap-4 sm:flex-col sm:items-end shrink-0">
                          <div className="text-right">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                              Exposure
                            </span>
                            <span className="text-base font-bold font-heading text-rose-700 tabular-nums">
                              ₹{ex.difference.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* 1-Click Institutional Bank Operations Action */}
                            <button
                              onClick={() => handleApproveException(ex)}
                              disabled={actionLoadingId === ex.id}
                              className="min-h-[34px] px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#065F46] hover:bg-[#044E39] text-white transition-all cursor-pointer flex items-center space-x-1 shadow-xs disabled:opacity-50"
                              title="Approve & Clear Settlement"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{actionLoadingId === ex.id ? "Clearing..." : "Approve & Clear"}</span>
                            </button>

                            <button
                              onClick={() => handleHoldException(ex)}
                              disabled={actionLoadingId === ex.id}
                              className="min-h-[34px] px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors cursor-pointer flex items-center space-x-1"
                              title="Hold & Flag for Bank Dispute Inquiry"
                            >
                              <Clock className="w-3.5 h-3.5 text-amber-700" />
                              <span>Hold</span>
                            </button>

                            <button
                              onClick={() => {
                                setWhatIfExId(ex.id);
                                setIsWhatIfOpen(true);
                              }}
                              className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-lg bg-white hover:bg-[#F5F6F3] text-slate-600 border border-[#E5E7EB] transition-colors cursor-pointer"
                              title="Simulate impact on daily close"
                            >
                              <Zap className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                setInvestigateExId(ex.id);
                                setIsInvestigatorOpen(true);
                              }}
                              className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-lg bg-white hover:bg-[#F5F6F3] text-slate-600 border border-[#E5E7EB] transition-colors cursor-pointer"
                              title="Inspect forensic trace"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                setReplayExId(ex.id);
                                setIsReplayOpen(true);
                              }}
                              className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-lg bg-white hover:bg-[#F5F6F3] text-slate-600 border border-[#E5E7EB] transition-colors cursor-pointer"
                              title="Audit replay"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* SECTION 2: Approved Settlements (Audit Cleared Ledger) */}
              <section className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-heading font-bold text-base text-slate-900 tracking-tight">
                        Approved &amp; Cleared Settlements
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {approvedSettlements.length} Cleared
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Exceptions verified, approved by controller, booked to fee variance, or cleared via bank confirmation
                    </p>
                  </div>
                </div>

                {approvedSettlements.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-500 space-y-1.5">
                    <p className="font-semibold text-slate-700">No Approved Settlements in This Cycle</p>
                    <p className="text-slate-500 max-w-sm mx-auto">
                      Click &ldquo;Approve &amp; Clear&rdquo; on any open exception above to clear the settlement batch and move it into this register.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#E5E7EB]">
                    {approvedSettlements.map((appItem) => (
                      <div key={appItem.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F5F6F3]/50 transition-colors rounded-xl px-2">
                        
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-xs text-slate-900">
                              {appItem.settlement_id || appItem.id}
                            </span>
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#F5F6F3] text-slate-600 border border-[#E5E7EB]">
                              {appItem.id}
                            </span>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Audit Cleared &amp; Posted
                            </span>
                          </div>

                          <p className="text-xs text-slate-600">
                            {appItem.resolution_notes || "Approved by Operations Controller. Booked to Gateway Variance Account."}
                          </p>

                          <div className="text-[11px] text-slate-500">
                            Cleared by <strong>{appItem.resolved_by || "Finance Ops"}</strong> · {appItem.resolved_at ? new Date(appItem.resolved_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "Today"}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 sm:flex-col sm:items-end shrink-0">
                          <div className="text-right">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                              Net Cleared
                            </span>
                            <span className="text-base font-bold font-heading text-[#065F46] tabular-nums">
                              ₹{appItem.expected_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              if (appItem.settlement_id) {
                                setTrailSettlementId(appItem.settlement_id);
                                setIsTrailOpen(true);
                              } else {
                                setReplayExId(appItem.id);
                                setIsReplayOpen(true);
                              }
                            }}
                            className="min-h-[32px] px-3 py-1 text-xs font-semibold rounded-lg bg-white hover:bg-[#F5F6F3] text-[#3730A3] border border-[#E5E7EB] transition-colors cursor-pointer flex items-center space-x-1"
                            title="View Money Trail & Clearing Proof"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#3730A3]" />
                            <span>Audit Proof</span>
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </section>

            </div>

            {/* Right Column: Period Close Readiness & Clearing Feed Sandbox */}
            <div className="space-y-6">

              {/* Period Close Readiness Card */}
              <section className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 space-y-4">
                <h2 className="font-heading font-bold text-base text-slate-900 tracking-tight">
                  Period Close Readiness
                </h2>

                <div className="flex items-center gap-5 pt-2">
                  <div className="relative w-24 h-24 shrink-0">
                    <svg viewBox="0 0 120 120" width="96" height="96" role="img" aria-label={`${readinessPct} percent ready`}>
                      <circle cx="60" cy="60" r="52" fill="none" stroke="#E5E7EB" strokeWidth="12"></circle>
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke={readinessPct >= 95 ? "#065F46" : readinessPct >= 80 ? "#3730A3" : "#BE123C"}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray="326.7"
                        strokeDashoffset={strokeDashoffset}
                        transform="rotate(-90 60 60)"
                        style={{ transition: "stroke-dashoffset 0.6s ease" }}
                      ></circle>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-heading font-bold text-xl text-slate-900 tabular-nums">
                      {readinessPct}%
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 leading-relaxed">
                    {pendingExceptions.length === 0 ? (
                      <span className="text-[#065F46] font-semibold block">
                        All settlement batches reconciled. Escrow books ready for sign-off.
                      </span>
                    ) : (
                      <span>
                        <strong className="text-slate-900">{pendingExceptions.length}</strong> open {pendingExceptions.length === 1 ? "exception" : "exceptions"} must be resolved or provisioned before closing the ledger.
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setIsDailyCloseOpen(true)}
                  className="w-full min-h-[42px] px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-50/70 hover:bg-indigo-100/70 text-[#3730A3] border border-indigo-200 transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <span>Inspect Close Criteria →</span>
                </button>
              </section>

              {/* Clearing Feed Sandbox */}
              <section className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading font-bold text-base text-slate-900 tracking-tight">
                    Clearing Feed Sandbox
                  </h2>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    Live Feeds
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-mono">
                  api.razorpay.com/v1/settlements ⟷ Axis Bank CBS
                </p>

                <div className="pt-2 space-y-2">
                  <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-slate-400 block">
                    Operational Simulation
                  </span>

                  <button
                    onClick={handleSimulateDelay}
                    className="w-full min-h-[42px] px-3.5 py-2 text-xs font-semibold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <Zap className="w-4 h-4 text-rose-600" />
                    <span>Simulate Settlement Delay (+₹26.4K)</span>
                  </button>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      onClick={() => handleSimulateWebhook("payment.captured")}
                      className="min-h-[38px] px-2 py-1.5 text-xs font-medium rounded-xl bg-white hover:bg-[#F5F6F3] text-slate-700 border border-[#E5E7EB] transition-colors cursor-pointer"
                    >
                      + Payment
                    </button>
                    <button
                      onClick={() => handleSimulateWebhook("settlement.processed")}
                      className="min-h-[38px] px-2 py-1.5 text-xs font-medium rounded-xl bg-white hover:bg-[#F5F6F3] text-slate-700 border border-[#E5E7EB] transition-colors cursor-pointer"
                    >
                      + Settlement
                    </button>
                    <button
                      onClick={() => handleSimulateWebhook("refund.created")}
                      className="min-h-[38px] px-2 py-1.5 text-xs font-medium rounded-xl bg-white hover:bg-[#F5F6F3] text-slate-700 border border-[#E5E7EB] transition-colors cursor-pointer"
                    >
                      + Refund
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  <span>Listening for gateway clearance signatures…</span>
                </div>
              </section>

            </div>

          </div>

        </main>
      </div>

      {/* Mobile Bottom Tab Bar (< 1024px) */}
      <BottomNav
        exceptionCount={pendingExceptions.length}
        onOpenDailyClose={() => setIsDailyCloseOpen(true)}
      />

      {/* Interactive Modals */}
      <WhyModal
        isOpen={isWhyOpen}
        onClose={() => setIsWhyOpen(false)}
        whyData={metrics?.why_breakdown}
      />

      <BenchmarkModal
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
      />

      <ExceptionDrawer
        exception={selectedException}
        onClose={() => setSelectedException(null)}
        onActionComplete={() => {
          setSelectedException(null);
          loadData();
        }}
      />

      <DailyCloseModal
        isOpen={isDailyCloseOpen}
        onClose={() => setIsDailyCloseOpen(false)}
        dailyCloseData={dailyClose}
        onRefresh={loadData}
      />

      <MoneyTrailModal
        settlementId={trailSettlementId}
        isOpen={isTrailOpen}
        onClose={() => setIsTrailOpen(false)}
      />

      <WhatIfModal
        exceptionId={whatIfExId}
        isOpen={isWhatIfOpen}
        onClose={() => setIsWhatIfOpen(false)}
        onApplyResolution={loadData}
      />

      <InvestigatorModal
        exceptionId={investigateExId}
        isOpen={isInvestigatorOpen}
        onClose={() => setIsInvestigatorOpen(false)}
        onResolve={loadData}
      />

      <AuditReplayModal
        exceptionId={replayExId}
        isOpen={isReplayOpen}
        onClose={() => setIsReplayOpen(false)}
      />

      <AccuracySafetyModal
        isOpen={isAccuracyOpen}
        onClose={() => setIsAccuracyOpen(false)}
      />

      <DecisionGateModal
        resultId={selectedGateResultId}
        isOpen={isGateOpen}
        onClose={() => setIsGateOpen(false)}
      />
    </div>
  );
}
