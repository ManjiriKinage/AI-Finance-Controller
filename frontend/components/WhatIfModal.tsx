"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  RefreshCw,
  Zap,
  Check
} from "lucide-react";
import { api, WhatIfSimulationResponse } from "@/lib/api";

interface WhatIfModalProps {
  exceptionId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onApplyResolution?: () => void;
}

export function WhatIfModal({ exceptionId, isOpen, onClose, onApplyResolution }: WhatIfModalProps) {
  const [data, setData] = useState<WhatIfSimulationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (isOpen && exceptionId) {
      setLoading(true);
      api.simulateWhatIf(exceptionId)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen, exceptionId]);

  if (!isOpen) return null;

  const handleApplyResolution = async () => {
    if (!exceptionId) return;
    try {
      setApplying(true);
      await api.takeExceptionAction(exceptionId, "APPROVE_ADJUSTMENT", "Simulated resolution applied via What-If decision engine.");
      if (onApplyResolution) onApplyResolution();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white shadow-lg shadow-amber-500/20">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">What-If Resolution Simulator</h2>
                <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-slate-800 text-amber-400 border border-amber-500/30 rounded-full">
                  {exceptionId}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulate instant financial impact of resolving this exception on cash-at-risk and close readiness
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-sm text-slate-400">Computing before-and-after financial balance sheet delta...</p>
          </div>
        ) : data ? (
          <div className="my-6 space-y-6 overflow-y-auto pr-1">
            
            {/* Target Exception Header */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Target Discrepancy</span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {data.exception_type.replace(/_/g, " ")} {data.target_settlement_id ? `(${data.target_settlement_id})` : ""}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Exposure Amount</span>
                <p className="text-xl font-bold text-rose-400">
                  ₹{data.exception_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Before vs After Side-by-Side Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* BEFORE STATE CARD */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Position (Before)</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                    {data.before_state.close_decision.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-850">
                    <span className="text-slate-400">Verified Cash:</span>
                    <span className="font-bold text-white">₹{(data.before_state.verified_cash / 100000).toFixed(2)}L</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-850">
                    <span className="text-slate-400">Cash At Risk:</span>
                    <span className="font-bold text-rose-400">₹{data.before_state.cash_at_risk.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-850">
                    <span className="text-slate-400">Close Readiness:</span>
                    <span className="font-bold text-amber-400">{data.before_state.close_readiness_pct}%</span>
                  </div>
                </div>
              </div>

              {/* AFTER STATE CARD (SIMULATED) */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-emerald-950/30 border border-emerald-500/40 space-y-4 shadow-lg">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-900/60">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Simulated Outcome (After)</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${
                    data.is_close_unlocked
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse"
                      : "bg-indigo-500/20 text-indigo-400 border-indigo-500/40"
                  }`}>
                    {data.after_state.close_decision.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-300">Verified Cash:</span>
                    <span className="font-bold text-emerald-400">₹{(data.after_state.verified_cash / 100000).toFixed(2)}L</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-300">Cash At Risk:</span>
                    <span className="font-bold text-emerald-400">
                      ₹{data.after_state.cash_at_risk.toLocaleString("en-IN", { minimumFractionDigits: 2 })}{" "}
                      <span className="text-[10px] text-emerald-400/90 font-normal">(-{data.risk_reduction_pct}%)</span>
                    </span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-300">Close Readiness:</span>
                    <span className="font-bold text-emerald-400">
                      {data.after_state.close_readiness_pct}% (+{data.readiness_delta_pct}%)
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* AI Impact Callout */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-emerald-950/30 border border-amber-700/30 flex items-start space-x-3.5">
              <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">CFO Decision Impact</h4>
                <p className="mt-1 text-xs text-slate-200 leading-relaxed">{data.ai_impact_narrative}</p>
              </div>
            </div>

          </div>
        ) : null}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-all"
          >
            Cancel
          </button>

          <button
            onClick={handleApplyResolution}
            disabled={applying || !data}
            className="flex items-center space-x-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{applying ? "Applying..." : "Apply Resolution & Update Close"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
