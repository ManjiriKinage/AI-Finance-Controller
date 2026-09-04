"use client";

import React, { useEffect, useState } from "react";
import {
  Activity,
  Layers,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  Cpu,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  RefreshCw,
  FileSpreadsheet,
  FileCheck2,
  Lock,
  ArrowRight,
  Sparkles,
  Search,
  Eye,
  History,
  Scale,
  Calculator,
  Crosshair
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { MetricCard } from "@/components/MetricCard";
import { WhyModal } from "@/components/WhyModal";
import { BenchmarkModal } from "@/components/BenchmarkModal";
import { ExceptionDrawer } from "@/components/ExceptionDrawer";
import { DailyCloseModal } from "@/components/DailyCloseModal";
import { MoneyTrailModal } from "@/components/MoneyTrailModal";
import { WhatIfModal } from "@/components/WhatIfModal";
import { InvestigatorModal } from "@/components/InvestigatorModal";
import { AuditReplayModal } from "@/components/AuditReplayModal";
import { ReliabilityModal } from "@/components/ReliabilityModal";
import { AccuracySafetyModal } from "@/components/AccuracySafetyModal";
import { CalculationProofModal } from "@/components/CalculationProofModal";
import { ChallengeModal } from "@/components/ChallengeModal";
import { LiveEventStreamWidget } from "@/components/LiveEventStreamWidget";
import { api, OverviewMetrics, ExceptionItem, BenchmarkMetrics, DailyCloseResponse } from "@/lib/api";

export default function OverviewPage() {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [benchmark, setBenchmark] = useState<BenchmarkMetrics | null>(null);
  const [exceptions, setExceptions] = useState<ExceptionItem[]>([]);
  const [dailyClose, setDailyClose] = useState<DailyCloseResponse | null>(null);
  const [selectedException, setSelectedException] = useState<ExceptionItem | null>(null);
  
  // Modals state
  const [trailSettlementId, setTrailSettlementId] = useState<string | null>(null);
  const [whatIfExId, setWhatIfExId] = useState<string | null>(null);
  const [investigateExId, setInvestigateExId] = useState<string | null>(null);
  const [replayExId, setReplayExId] = useState<string | null>(null);
  const [calcSettlementId, setCalcSettlementId] = useState<string | null>(null);
  const [challengeResultId, setChallengeResultId] = useState<number | null>(null);
  
  const [isWhyOpen, setIsWhyOpen] = useState(false);
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState(false);
  const [isDailyCloseOpen, setIsDailyCloseOpen] = useState(false);
  const [isTrailOpen, setIsTrailOpen] = useState(false);
  const [isWhatIfOpen, setIsWhatIfOpen] = useState(false);
  const [isInvestigatorOpen, setIsInvestigatorOpen] = useState(false);
  const [isReplayOpen, setIsReplayOpen] = useState(false);
  const [isReliabilityOpen, setIsReliabilityOpen] = useState(false);
  const [isAccuracyOpen, setIsAccuracyOpen] = useState(false);
  const [isCalcProofOpen, setIsCalcProofOpen] = useState(false);
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [overviewData, benchmarkData, exData, closeData] = await Promise.all([
        api.getOverview(),
        api.getBenchmark(),
        api.getExceptions({ status: "OPEN" }),
        api.getDailyClose()
      ]);
      setMetrics(overviewData);
      setBenchmark(benchmarkData);
      setExceptions(exData);
      setDailyClose(closeData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleActionComplete = (updated: ExceptionItem) => {
    setSelectedException(null);
    loadData();
  };

  const handleOpenTrail = (settlementId?: string) => {
    if (settlementId) {
      setTrailSettlementId(settlementId);
      setIsTrailOpen(true);
    }
  };

  const handleOpenWhatIf = (exId: string) => {
    setWhatIfExId(exId);
    setIsWhatIfOpen(true);
  };

  const handleOpenInvestigator = (exId: string) => {
    setInvestigateExId(exId);
    setIsInvestigatorOpen(true);
  };

  const handleOpenReplay = (exId: string) => {
    setReplayExId(exId);
    setIsReplayOpen(true);
  };

  const handleOpenCalcProof = (settlementId?: string) => {
    if (settlementId) {
      setCalcSettlementId(settlementId);
      setIsCalcProofOpen(true);
    }
  };

  const handleOpenChallenge = (resId: number = 1) => {
    setChallengeResultId(resId);
    setIsChallengeOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar
        onReconcileTrigger={loadData}
        onOpenBenchmark={() => setIsBenchmarkOpen(true)}
        onOpenDailyClose={() => setIsDailyCloseOpen(true)}
        onOpenAccuracyCenter={() => setIsAccuracyOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Header with "RUN AI DAILY CLOSE" & "Accuracy Stress Test" */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-700/30 shadow-2xl">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                AI Finance Controller
              </h1>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Active Gateway: <strong className="text-white">Razorpay</strong> ⟷ Settlement Bank: <strong className="text-white">Axis Bank (*7849)</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Signature RUN AI DAILY CLOSE Button */}
            <button
              onClick={() => setIsDailyCloseOpen(true)}
              className="flex items-center space-x-2 px-5 py-3 text-xs sm:text-sm font-bold rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white shadow-xl shadow-indigo-600/30 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <FileCheck2 className="w-4 h-4 text-white" />
              <span>RUN AI DAILY CLOSE</span>
            </button>

            {/* Accuracy & Safety Stress Test */}
            <button
              onClick={() => setIsAccuracyOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-3 text-xs font-bold rounded-2xl bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 shadow-md transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Accuracy Center (5k Stress)</span>
            </button>

            {/* Challenge Controller */}
            <button
              onClick={() => handleOpenChallenge(1)}
              className="flex items-center space-x-1.5 px-3.5 py-3 text-xs font-semibold rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-rose-400 border border-rose-500/30 transition-all cursor-pointer"
            >
              <Crosshair className="w-4 h-4 text-rose-400" />
              <span>Challenge Match</span>
            </button>

            {/* AI vs Rules Transparency */}
            <button
              onClick={() => setIsReliabilityOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-3 text-xs font-semibold rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all cursor-pointer"
            >
              <Scale className="w-4 h-4 text-indigo-400" />
              <span>AI vs Rules</span>
            </button>
          </div>
        </div>

        {/* 4 Hero KPI Cards with Universal "WHY?" drilldown buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <MetricCard
            title="Total Volume Processed"
            value={metrics ? `₹${(metrics.actual_bank_credit_total / 100000).toFixed(2)}L` : "₹24.71L"}
            subtitle={`${metrics?.total_transactions || 1248} records verified`}
            icon={Layers}
            statusColor="indigo"
            clickableText="View Details"
            onClick={() => setIsWhyOpen(true)}
          />

          <MetricCard
            title="Reconciliation Match Rate"
            value={metrics ? `${metrics.match_rate}%` : "95.83%"}
            subtitle={`${metrics?.matched_count || 1196} clean matches`}
            icon={ShieldCheck}
            statusColor="emerald"
            trend="100% Precision"
            trendPositive={true}
            clickableText="Audit Accuracy"
            onClick={() => setIsAccuracyOpen(true)}
          />

          <MetricCard
            title="Cash At Risk"
            value={dailyClose ? `₹${dailyClose.cash_at_risk_total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "₹1.08L"}
            subtitle={`Readiness: ${dailyClose?.close_readiness_pct || 91.2}%`}
            icon={AlertTriangle}
            statusColor="rose"
            clickableText="Decompose Risk"
            onClick={() => setIsDailyCloseOpen(true)}
          />

          <MetricCard
            title="Unexplained Difference"
            value={metrics ? `₹${metrics.unexplained_difference.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "₹10,600.00"}
            subtitle="Click to view root causes"
            icon={HelpCircle}
            statusColor="amber"
            clickableText="Ask Why?"
            onClick={() => setIsWhyOpen(true)}
          />

        </div>

        {/* Live Razorpay Event Stream Ticker & Action Center Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Controller Action Center ("What to Fix First") */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-bold text-white">Controller Action Center: What to Fix First?</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">
                  Ranked by Cash Impact
                </span>
              </div>
              <Link href="/exceptions" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
                View All Exceptions &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {exceptions.slice(0, 4).map((ex, idx) => (
                <div
                  key={ex.id}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-850 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-md"
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="flex flex-col items-center justify-center w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-indigo-400 flex-shrink-0">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white">{ex.id}</span>
                        {ex.lineage_id && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-950 text-slate-400 border border-slate-800 rounded">
                            {ex.lineage_id}
                          </span>
                        )}
                        <span className="text-xs text-slate-300 font-semibold">• {ex.exception_type.replace(/_/g, " ")}</span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded-md">
                          {ex.confidence}% conf
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                        {ex.ai_explanation?.summary || ex.recommended_action}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <div className="text-left sm:text-right mr-2">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Cash Impact</span>
                      <p className="text-sm font-bold text-rose-400">
                        ₹{ex.difference.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {/* What-If Simulator Action */}
                      <button
                        onClick={() => handleOpenWhatIf(ex.id)}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-700/50 transition-all cursor-pointer flex items-center space-x-1"
                        title="Simulate impact on cash-at-risk"
                      >
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>What-If</span>
                      </button>

                      {/* Deep SQL Investigator Action */}
                      <button
                        onClick={() => handleOpenInvestigator(ex.id)}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-700/50 transition-all cursor-pointer flex items-center space-x-1"
                        title="7-step auditable SQL investigation trace"
                      >
                        <Search className="w-3 h-3 text-purple-400" />
                        <span>SQL Audit</span>
                      </button>

                      {/* Math Proof Action */}
                      {ex.settlement_id && (
                        <button
                          onClick={() => handleOpenCalcProof(ex.settlement_id)}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/50 transition-all cursor-pointer flex items-center space-x-1"
                          title="Line-item calculation proof"
                        >
                          <Calculator className="w-3 h-3" />
                          <span>Math</span>
                        </button>
                      )}

                      {/* Audit Replay Action */}
                      <button
                        onClick={() => handleOpenReplay(ex.id)}
                        className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
                        title="View chronological audit replay"
                      >
                        <History className="w-3 h-3" />
                      </button>

                      {/* Money Trail Action */}
                      {ex.settlement_id && (
                        <button
                          onClick={() => handleOpenTrail(ex.settlement_id)}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-all cursor-pointer"
                        >
                          Trail
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right 1 Col: Live Razorpay Event Stream & Close Readiness */}
          <div className="space-y-6">
            
            {/* Live Webhook Event Stream Widget with Demo Anomaly Injection */}
            <LiveEventStreamWidget onEventProcessed={loadData} />

            {/* Daily Close Status Widget */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Close Readiness</span>
                <span className="text-xs font-bold text-emerald-400">{dailyClose?.close_readiness_pct || 91.2}%</span>
              </div>

              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${dailyClose?.close_readiness_pct || 91.2}%` }}
                />
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                {dailyClose?.close_decision === "CANNOT_CLOSE"
                  ? `⚠ ${dailyClose.critical_exceptions_count} critical blockers must be resolved before daily financial close.`
                  : "✓ All financial positions verified. Ready for books closure."}
              </p>

              <button
                onClick={() => setIsDailyCloseOpen(true)}
                className="w-full py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all cursor-pointer"
              >
                Open Daily Close Center &rarr;
              </button>
            </div>

          </div>

        </div>

      </main>

      {/* Modals & Slide-out Drawers */}
      <DailyCloseModal
        isOpen={isDailyCloseOpen}
        onClose={() => setIsDailyCloseOpen(false)}
        dailyCloseData={dailyClose}
        onRefresh={loadData}
      />

      <AccuracySafetyModal
        isOpen={isAccuracyOpen}
        onClose={() => setIsAccuracyOpen(false)}
      />

      <CalculationProofModal
        settlementId={calcSettlementId}
        isOpen={isCalcProofOpen}
        onClose={() => setIsCalcProofOpen(false)}
      />

      <ChallengeModal
        resultId={challengeResultId}
        isOpen={isChallengeOpen}
        onClose={() => setIsChallengeOpen(false)}
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

      <ReliabilityModal
        isOpen={isReliabilityOpen}
        onClose={() => setIsReliabilityOpen(false)}
      />

      <MoneyTrailModal
        settlementId={trailSettlementId}
        isOpen={isTrailOpen}
        onClose={() => setIsTrailOpen(false)}
      />

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
        onActionComplete={handleActionComplete}
      />

    </div>
  );
}
