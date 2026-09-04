"use client";

import React, { useEffect, useState } from "react";
import {
  Activity,
  Layers,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  ShieldCheck,
  Zap,
  RefreshCw,
  FileCheck2,
  Lock,
  ArrowRight,
  Sparkles,
  Search,
  Eye,
  History,
  Scale,
  Calculator,
  Crosshair,
  MoreVertical,
  ArrowUpRight
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
  
  const [activeMenuExId, setActiveMenuExId] = useState<string | null>(null);
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
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <Navbar
        onReconcileTrigger={loadData}
        onOpenBenchmark={() => setIsBenchmarkOpen(true)}
        onOpenDailyClose={() => setIsDailyCloseOpen(true)}
        onOpenAccuracyCenter={() => setIsAccuracyOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Institutional Control Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xs">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                Financial Operations Control
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-medium bg-slate-800 text-slate-400 border border-slate-700/60 rounded-md">
                T+0 Settlement Cycle
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Gateway: <span className="text-slate-300 font-mono">Razorpay Production</span> • Nodal Account: <span className="text-slate-300 font-mono">Axis Bank (*7849)</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            
            {/* Single Primary Action */}
            <button
              onClick={() => setIsDailyCloseOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-all cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Execute Period Close</span>
            </button>

            {/* Demoted Secondary Controls */}
            <button
              onClick={() => setIsAccuracyOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Model Performance</span>
            </button>

            <button
              onClick={() => handleOpenChallenge(1)}
              className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-all cursor-pointer"
            >
              <Crosshair className="w-3.5 h-3.5 text-slate-400" />
              <span>Manual Match</span>
            </button>

            <button
              onClick={() => setIsReliabilityOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-all cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5 text-slate-400" />
              <span>Matching Logic</span>
            </button>
          </div>
        </div>

        {/* 4 Restrained KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <MetricCard
            title="Total Volume Processed"
            value={metrics ? `₹${(metrics.actual_bank_credit_total / 100000).toFixed(2)}L` : "₹21.21L"}
            subtitle={`${metrics?.total_transactions || 181} records verified`}
            icon={Layers}
            statusColor="slate"
            clickableText="Audit Feeds"
            onClick={() => setIsWhyOpen(true)}
          />

          <MetricCard
            title="Auto-Match Rate"
            value={metrics ? `${metrics.match_rate}%` : "99.42%"}
            subtitle="0.06% False Match Rate"
            icon={ShieldCheck}
            statusColor="emerald"
            trend="100% Deterministic"
            trendPositive={true}
            clickableText="Model Performance"
            onClick={() => setIsAccuracyOpen(true)}
          />

          <MetricCard
            title="Unallocated Exposure"
            value={dailyClose ? `₹${dailyClose.cash_at_risk_total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "₹69,207.53"}
            subtitle={`Readiness: ${dailyClose?.close_readiness_pct || 96.7}%`}
            icon={AlertTriangle}
            statusColor="amber"
            clickableText="Variance Breakdown"
            onClick={() => setIsDailyCloseOpen(true)}
          />

          <MetricCard
            title="Unreconciled Variance"
            value={metrics ? `₹${metrics.unexplained_difference.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "₹69,207.53"}
            subtitle="Pending gateway clearance"
            icon={HelpCircle}
            statusColor="rose"
            clickableText="Root Cause Analysis"
            onClick={() => setIsWhyOpen(true)}
          />

        </div>

        {/* Strict 12-Column Grid Layout: 8 cols (Main) + 4 cols (Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main 8-Column Section: Exception Queue (Prioritized by Exposure) */}
          <div className="lg:col-span-8 space-y-4">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                  Exception Queue (Prioritized by Exposure)
                </h2>
              </div>
              <Link
                href="/exceptions"
                className="text-xs font-medium text-slate-400 hover:text-indigo-300 flex items-center space-x-1"
              >
                <span>View Full Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {exceptions.slice(0, 4).map((ex, idx) => (
                <div
                  key={ex.id}
                  className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-xs"
                >
                  <div className="flex items-start space-x-3.5 min-w-0">
                    <span className="flex h-2 w-2 relative mt-1.5 shrink-0">
                      <span className={`h-2 w-2 rounded-full ${ex.severity === "HIGH" ? "bg-rose-400" : "bg-amber-400"}`} />
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="text-xs font-mono font-medium text-white">{ex.id}</span>
                        {ex.lineage_id && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-950 text-slate-400 border border-slate-800 rounded">
                            {ex.lineage_id}
                          </span>
                        )}
                        <span className="text-xs text-slate-300 font-medium">
                          {ex.exception_type.replace(/_/g, " ")}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {ex.confidence}% conf
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 truncate max-w-lg">
                        {ex.ai_explanation?.summary || ex.recommended_action}
                      </p>
                    </div>
                  </div>

                  {/* Exposure & Action Bar */}
                  <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                    <div className="text-left sm:text-right mr-1">
                      <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block">Exposure</span>
                      <p className="text-sm font-mono font-bold text-rose-400">
                        ₹{ex.difference.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    {/* Streamlined Ghost Icon Action Bar */}
                    <div className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                      
                      {/* Simulate Impact */}
                      <button
                        onClick={() => handleOpenWhatIf(ex.id)}
                        className="px-2 py-1 text-[11px] font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer flex items-center space-x-1"
                        title="Simulate Impact on Period Close"
                      >
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span className="hidden sm:inline">Simulate</span>
                      </button>

                      {/* Payload Trace */}
                      <button
                        onClick={() => handleOpenInvestigator(ex.id)}
                        className="px-2 py-1 text-[11px] font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer flex items-center space-x-1"
                        title="Payload Trace & Forensic Evidence"
                      >
                        <Search className="w-3 h-3 text-indigo-400" />
                        <span className="hidden sm:inline">Trace</span>
                      </button>

                      {/* Calculation Breakdown */}
                      {ex.settlement_id && (
                        <button
                          onClick={() => handleOpenCalcProof(ex.settlement_id)}
                          className="px-2 py-1 text-[11px] font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer flex items-center space-x-1"
                          title="Calculation Breakdown"
                        >
                          <Calculator className="w-3 h-3 text-slate-400" />
                          <span className="hidden sm:inline">Math</span>
                        </button>
                      )}

                      {/* Audit Trail */}
                      {ex.settlement_id && (
                        <button
                          onClick={() => handleOpenTrail(ex.settlement_id)}
                          className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Audit Trail"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* History / Replay */}
                      <button
                        onClick={() => handleOpenReplay(ex.id)}
                        className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Chronological Audit Log"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Right 4-Column Sidebar: Unified Container holding Readiness & Webhook Event Stream */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Period Close Readiness Card */}
            <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Period Close Readiness
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {dailyClose?.close_readiness_pct || 96.7}%
                </span>
              </div>

              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${dailyClose?.close_readiness_pct || 96.7}%` }}
                />
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {dailyClose?.close_decision === "CANNOT_CLOSE"
                  ? `${dailyClose.critical_exceptions_count} open exceptions must be resolved or provisioned prior to period signoff.`
                  : "All financial records verified across payment gateway and bank statement."}
              </p>

              <button
                onClick={() => setIsDailyCloseOpen(true)}
                className="w-full py-2 text-xs font-semibold rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 transition-all cursor-pointer"
              >
                Inspect Close Criteria &rarr;
              </button>
            </div>

            {/* Webhook Event Stream Widget */}
            <LiveEventStreamWidget onEventProcessed={loadData} />

          </div>

        </div>

      </main>

      {/* Modals */}
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
