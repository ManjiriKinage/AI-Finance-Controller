"use client";

import React, { useState } from "react";
import {
  X,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Lock,
  Sparkles,
  Layers,
  ChevronRight,
  Eye,
  Zap,
  Check
} from "lucide-react";
import { DailyCloseResponse, api } from "@/lib/api";
import { MoneyTrailModal } from "./MoneyTrailModal";

interface DailyCloseModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyCloseData: DailyCloseResponse | null;
  onRefresh?: () => void;
}

export function DailyCloseModal({ isOpen, onClose, dailyCloseData, onRefresh }: DailyCloseModalProps) {
  const [selectedSettlementId, setSelectedSettlementId] = useState<string | null>(null);
  const [isTrailOpen, setIsTrailOpen] = useState(false);
  const [runningClose, setRunningClose] = useState(false);
  const [applyingRoute, setApplyingRoute] = useState<string | null>(null);

  if (!isOpen || !dailyCloseData) return null;

  const handleOpenTrail = (settlementId?: string) => {
    if (settlementId) {
      setSelectedSettlementId(settlementId);
      setIsTrailOpen(true);
    }
  };

  const handleRerunClose = async () => {
    try {
      setRunningClose(true);
      await api.runDailyClose();
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
      for (const exId of exIds) {
        await api.takeExceptionAction(exId, "APPROVE_ADJUSTMENT", `Resolved via Fastest Route to Close (${routeId})`);
      }
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setApplyingRoute(null);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
        <div className="relative w-full max-w-5xl rounded-3xl bg-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col justify-between">
          
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-500 text-white shadow-lg shadow-indigo-500/20">
                <FileCheck2 className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">AI Daily Close Command Center</h2>
                  <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-slate-800 text-indigo-300 border border-indigo-500/30 rounded-full">
                    {dailyCloseData.cycle_date}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Multi-Source Balance Sheet Consolidation: Razorpay Payments ⟷ Settlement Batches ⟷ Bank Credit Statements
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="my-5 space-y-6 overflow-y-auto pr-1">
            
            {/* Top 6 KPI Metric Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gross Volume</span>
                <p className="text-base font-bold text-white mt-1">₹{(dailyCloseData.payments_processed_gross / 100000).toFixed(2)}L</p>
                <span className="text-[10px] text-slate-500">{dailyCloseData.payments_processed_count} Payments</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Expected Net</span>
                <p className="text-base font-bold text-indigo-400 mt-1">₹{(dailyCloseData.expected_settlement_total / 100000).toFixed(2)}L</p>
                <span className="text-[10px] text-slate-500">Post MDR Fee & GST</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bank Received</span>
                <p className="text-base font-bold text-slate-200 mt-1">₹{(dailyCloseData.bank_received_total / 100000).toFixed(2)}L</p>
                <span className="text-[10px] text-slate-500">Axis Bank Inflows</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/30">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Verified Cash</span>
                <p className="text-base font-bold text-emerald-400 mt-1">₹{(dailyCloseData.verified_cash_total / 100000).toFixed(2)}L</p>
                <span className="text-[10px] text-emerald-500/80 font-medium">✓ 100% Reconciled</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-rose-500/30">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Cash At Risk</span>
                <p className="text-base font-bold text-rose-400 mt-1">₹{dailyCloseData.cash_at_risk_total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                <span className="text-[10px] text-rose-400/80 font-medium">{dailyCloseData.critical_exceptions_count} Blocker Items</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Readiness</span>
                <p className="text-base font-bold text-indigo-300 mt-1">{dailyCloseData.close_readiness_pct}%</p>
                <span className="text-[10px] text-slate-500">Score to Close</span>
              </div>

            </div>

            {/* CFO Determination Banner */}
            <div className={`p-4 rounded-2xl border flex items-start space-x-3.5 ${
              dailyCloseData.close_decision === "CANNOT_CLOSE"
                ? "bg-gradient-to-r from-rose-950/40 via-slate-900 to-amber-950/30 border-rose-600/50 text-rose-200"
                : "bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/30 border-emerald-500/50 text-emerald-200"
            }`}>
              {dailyCloseData.close_decision === "CANNOT_CLOSE" ? (
                <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    CFO Close Determination: {dailyCloseData.close_decision.replace(/_/g, " ")}
                  </h4>
                  <span className="text-[11px] font-mono font-bold text-slate-400">
                    Match Rate: {dailyCloseData.match_rate_pct}%
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {dailyCloseData.close_decision_summary}
                </p>
              </div>
            </div>

            {/* Fastest Route to Close Pathfinder (3 Options) */}
            {dailyCloseData.fastest_routes_to_close.length > 0 && (
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-indigo-700/40 space-y-3 shadow-lg">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">Fastest Route to Close (Pathfinder)</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {dailyCloseData.fastest_routes_to_close.map((route) => (
                    <div
                      key={route.option_id}
                      className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 flex flex-col justify-between hover:border-indigo-500/40 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{route.title}</span>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            route.is_fully_closed
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                          }`}>
                            {route.resulting_readiness_pct}%
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1">{route.description}</p>
                      </div>

                      <button
                        onClick={() => handleApplyRoute(route.option_id, route.exceptions_to_resolve)}
                        disabled={applyingRoute !== null || route.exceptions_to_resolve.length === 0}
                        className="w-full py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{applyingRoute === route.option_id ? "Applying..." : "Execute Route"}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Decomposition Matrix */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Automated Cash at Risk Decomposition ({dailyCloseData.risk_breakdown.length} Categories)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dailyCloseData.risk_breakdown.map((cat) => (
                  <div
                    key={cat.category}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex items-start justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white">{cat.label}</span>
                        <span className="px-1.5 py-0.2 text-[10px] font-mono bg-slate-800 text-slate-300 rounded">
                          {cat.count} items
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{cat.description}</p>
                      {cat.representative_settlement_id && (
                        <button
                          onClick={() => handleOpenTrail(cat.representative_settlement_id)}
                          className="mt-2 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Follow Money Trail ({cat.representative_settlement_id})</span>
                        </button>
                      )}
                    </div>

                    <div className="text-right flex-shrink-0 ml-3">
                      <span className="text-sm font-bold text-rose-400 block">
                        ₹{cat.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">{cat.impact_pct}% of risk</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={handleRerunClose}
              disabled={runningClose}
              className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${runningClose ? "animate-spin" : ""}`} />
              <span>{runningClose ? "Recalculating..." : "Re-Run Daily Close"}</span>
            </button>

            <button
              onClick={onClose}
              className="px-6 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all cursor-pointer"
            >
              Close Window
            </button>
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
