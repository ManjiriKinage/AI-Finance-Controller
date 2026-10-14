"use client";

import React, { useState } from "react";
import {
  FileCheck2,
  X,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  Zap,
  Check,
  ArrowRight,
  Eye,
  SlidersHorizontal,
  Flame,
  HelpCircle,
  Lock
} from "lucide-react";
import { DailyCloseResponse, api } from "@/lib/api";
import { MoneyTrailModal } from "./MoneyTrailModal";

interface DailyCloseModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyCloseData: DailyCloseResponse | null;
  onRefresh?: () => void;
}

export function DailyCloseModal({
  isOpen,
  onClose,
  dailyCloseData,
  onRefresh
}: DailyCloseModalProps) {
  const [runningClose, setRunningClose] = useState(false);
  const [executingClose, setExecutingClose] = useState(false);
  const [applyingRoute, setApplyingRoute] = useState<string | null>(null);
  const [selectedSettlementId, setSelectedSettlementId] = useState<string | null>(null);
  const [isTrailOpen, setIsTrailOpen] = useState(false);
  const [closeSuccessMessage, setCloseSuccessMessage] = useState<string | null>(null);

  if (!isOpen || !dailyCloseData) return null;

  const handleRerunClose = async () => {
    try {
      setRunningClose(true);
      await api.getDailyClose();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setRunningClose(false);
    }
  };

  const handleApplyRoute = async (routeId: string, exIds: string[]) => {
    try {
      setApplyingRoute(routeId);
      for (const id of exIds) {
        await api.takeExceptionAction(id, "APPROVE_ADJUSTMENT", "Batch resolution via Daily Close Pathfinder");
      }
      setCloseSuccessMessage(`Route ${routeId} executed successfully: ${exIds.length} exceptions provisioned & resolved.`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setApplyingRoute(null);
    }
  };

  const handleExecutePeriodClose = async () => {
    try {
      setExecutingClose(true);
      await api.executeDailyClose("FINANCE_CONTROLLER");
      setCloseSuccessMessage("Daily Period Close executed successfully! All balances provisioned, general ledger signed off and locked.");
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setExecutingClose(false);
    }
  };

  const handleOpenTrail = (settlementId?: string) => {
    if (settlementId) {
      setSelectedSettlementId(settlementId);
      setIsTrailOpen(true);
    }
  };

  const isFullyReconciled = dailyCloseData.close_readiness_pct >= 99.0 || dailyCloseData.cash_at_risk_total === 0;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
        <div className="relative w-full max-w-5xl rounded-2xl bg-white border border-[#E5E7EB] p-6 sm:p-8 shadow-none overflow-hidden max-h-[92vh] flex flex-col justify-between space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-[#E5E7EB]">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-[#3730A3]">
                <FileCheck2 className="w-6 h-6 stroke-[1.5]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="font-heading font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
                    Period Close Command
                  </h2>
                  <span className="px-2.5 py-0.5 text-xs font-mono font-medium bg-[#F5F6F3] text-slate-700 border border-[#E5E7EB] rounded-lg">
                    {dailyCloseData.cycle_date}
                  </span>
                  {isFullyReconciled && (
                    <span className="px-2.5 py-0.5 text-xs font-mono font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
                      Signed Off &amp; Locked
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Multi-Source Balance Sheet Consolidation: Razorpay Payments ⟷ Settlement Batches ⟷ Axis Bank Statement Credits
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close Modal"
              className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 hover:bg-[#F5F6F3] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>

          <div className="space-y-6 overflow-y-auto pr-1">

            {/* Success Banner */}
            {closeSuccessMessage && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1 text-xs leading-relaxed font-medium">
                  {closeSuccessMessage}
                </div>
              </div>
            )}

            {/* Top 6 KPI Metric Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">

              <div className="p-3.5 rounded-xl bg-[#F5F6F3] border border-[#E5E7EB] space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 font-mono">Gross Volume</span>
                <p className="text-base font-bold text-slate-900 font-mono tabular-nums">
                  ₹{(dailyCloseData.payments_processed_gross / 100000).toFixed(2)}L
                </p>
                <span className="text-[10px] text-slate-500">{dailyCloseData.payments_processed_count} Payments</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F5F6F3] border border-[#E5E7EB] space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 font-mono">Expected Net</span>
                <p className="text-base font-bold text-[#3730A3] font-mono tabular-nums">
                  ₹{(dailyCloseData.expected_settlement_total / 100000).toFixed(2)}L
                </p>
                <span className="text-[10px] text-slate-500">Post MDR Fee &amp; GST</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F5F6F3] border border-[#E5E7EB] space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 font-mono">Bank Received</span>
                <p className="text-base font-bold text-slate-900 font-mono tabular-nums">
                  ₹{(dailyCloseData.bank_received_total / 100000).toFixed(2)}L
                </p>
                <span className="text-[10px] text-slate-500">Axis Bank Inflows</span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 font-mono">Verified Cash</span>
                <p className="text-base font-bold text-emerald-800 font-mono tabular-nums">
                  ₹{(dailyCloseData.verified_cash_total / 100000).toFixed(2)}L
                </p>
                <span className="text-[10px] text-emerald-700 font-medium">100% Reconciled</span>
              </div>

              <div className="p-3.5 rounded-xl bg-red-50/50 border border-red-200 space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-red-700 font-mono">Cash At Risk</span>
                <p className="text-base font-bold text-red-700 font-mono tabular-nums">
                  ₹{dailyCloseData.cash_at_risk_total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[10px] text-red-700 font-medium">{dailyCloseData.critical_exceptions_count} Blocker Items</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F5F6F3] border border-[#E5E7EB] space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 font-mono">Readiness</span>
                <p className="text-base font-bold text-[#3730A3] font-mono tabular-nums">
                  {dailyCloseData.close_readiness_pct}%
                </p>
                <span className="text-[10px] text-slate-500">Score to Close</span>
              </div>

            </div>

            {/* Close Determination Banner */}
            <div className={`p-4 rounded-xl border flex items-start space-x-3.5 ${
              isFullyReconciled || dailyCloseData.close_decision === "READY_TO_CLOSE"
                ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                : "bg-red-50/60 border-red-200 text-red-900"
            }`}>
              {isFullyReconciled || dailyCloseData.close_decision === "READY_TO_CLOSE" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 stroke-[1.5]" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5 stroke-[1.5]" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider font-mono">
                    Close Determination: {isFullyReconciled ? "READY TO CLOSE" : dailyCloseData.close_decision.replace(/_/g, " ")}
                  </h4>
                  <span className="text-xs font-mono font-bold">
                    Match Rate: {dailyCloseData.match_rate_pct}%
                  </span>
                </div>
                <p className="text-xs mt-1 leading-relaxed text-slate-700">
                  {isFullyReconciled
                    ? "All settlement batches and bank credits are reconciled down to 0 paise. You are cleared to execute the final period close sign-off below."
                    : dailyCloseData.close_decision_summary}
                </p>
              </div>
            </div>

            {/* Fastest Route to Close Pathfinder (3 Options) */}
            {dailyCloseData.fastest_routes_to_close.length > 0 && !isFullyReconciled && (
              <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] space-y-3">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-amber-600 stroke-[1.5]" />
                  <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-900">
                    Fastest Route to Close (Pathfinder)
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {dailyCloseData.fastest_routes_to_close.map((route) => (
                    <div
                      key={route.option_id}
                      className="p-4 rounded-xl bg-[#F5F6F3] border border-[#E5E7EB] space-y-3 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{route.title}</span>
                          <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md ${
                            route.is_fully_closed
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-indigo-100 text-[#3730A3] border border-indigo-200"
                          }`}>
                            {route.resulting_readiness_pct}%
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{route.description}</p>
                      </div>

                      <button
                        onClick={() => handleApplyRoute(route.option_id, route.exceptions_to_resolve)}
                        disabled={applyingRoute !== null || route.exceptions_to_resolve.length === 0}
                        className="w-full min-h-[42px] px-3 py-2 text-xs font-semibold rounded-lg bg-[#3730A3] hover:bg-indigo-900 text-white transition-colors flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[1.5]" />
                        <span>{applyingRoute === route.option_id ? "Applying Route..." : "Execute Route"}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Decomposition Matrix */}
            <div className="space-y-3">
              <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-500 font-mono">
                Automated Cash at Risk Decomposition ({dailyCloseData.risk_breakdown.length} Categories)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dailyCloseData.risk_breakdown.map((cat) => (
                  <div
                    key={cat.category}
                    className="p-4 rounded-xl bg-white border border-[#E5E7EB] flex items-start justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900">{cat.label}</span>
                        <span className="px-2 py-0.5 text-[10px] font-mono bg-[#F5F6F3] text-slate-600 rounded-md border border-[#E5E7EB]">
                          {cat.count} items
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{cat.description}</p>
                      {cat.representative_settlement_id && (
                        <button
                          onClick={() => handleOpenTrail(cat.representative_settlement_id)}
                          className="mt-2 text-xs font-semibold text-[#3730A3] hover:underline flex items-center space-x-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 stroke-[1.5]" />
                          <span>Follow Money Trail ({cat.representative_settlement_id})</span>
                        </button>
                      )}
                    </div>

                    <div className="text-right shrink-0 ml-3">
                      <span className="text-sm font-bold text-red-600 block font-mono tabular-nums">
                        ₹{cat.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{cat.impact_pct}% of risk</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Footer Actions with Functional Execute Close */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#E5E7EB]">
            <button
              onClick={handleRerunClose}
              disabled={runningClose || executingClose}
              className="min-h-[42px] flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-[#F5F6F3] text-slate-700 border border-[#E5E7EB] transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 stroke-[1.5] ${runningClose ? "animate-spin" : ""}`} />
              <span>{runningClose ? "Recalculating..." : "Re-Calculate"}</span>
            </button>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={handleExecutePeriodClose}
                disabled={executingClose}
                className="flex-1 sm:flex-none min-h-[44px] px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#065F46] hover:bg-[#044E39] text-white transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow-xs disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{executingClose ? "Signing Off Period..." : "Sign-Off & Execute Period Close"}</span>
              </button>

              <button
                onClick={onClose}
                className="min-h-[44px] px-5 py-2.5 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>

        </div>
      </div>

      <MoneyTrailModal
        settlementId={selectedSettlementId}
        isOpen={isTrailOpen}
        onClose={() => setIsTrailOpen(false)}
      />
    </>
  );
}
