"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Sparkles,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white border border-[#E4E6E0] p-6 sm:p-8 shadow-none overflow-hidden max-h-[92vh] flex flex-col justify-between space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E4E6E0]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <Zap className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
                  What-If Resolution Simulator
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-mono font-medium bg-[#F5F6F3] text-slate-700 border border-[#E4E6E0] rounded-lg">
                  {exceptionId}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Simulate instant financial impact of resolving this exception on cash-at-risk and close readiness
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-[#E4E6E0] text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[1.75]" />
          </button>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#3730A3] animate-spin" />
            <p className="text-sm text-slate-500">Computing before-and-after financial balance sheet delta...</p>
          </div>
        ) : data ? (
          <div className="my-2 space-y-6 overflow-y-auto pr-1">

            {/* Target Exception Header */}
            <div className="p-4 rounded-xl bg-[#F5F6F3] border border-[#E4E6E0] flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Target Discrepancy</span>
                <h3 className="text-base font-heading font-bold text-slate-900 mt-0.5">
                  {data.exception_type.replace(/_/g, " ")} {data.target_settlement_id ? `(${data.target_settlement_id})` : ""}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Exposure Amount</span>
                <p className="text-xl font-heading font-bold text-rose-700 tabular-nums">
                  ₹{data.exception_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Before vs After Side-by-Side Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* BEFORE STATE CARD */}
              <div className="p-5 rounded-xl bg-[#F5F6F3] border border-[#E4E6E0] space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#E4E6E0]">
                  <span className="text-xs font-heading font-bold uppercase tracking-wider text-slate-700">
                    Current Position (Before)
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    {data.before_state.close_decision.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between p-2.5 rounded-lg bg-white border border-[#E4E6E0]">
                    <span className="text-slate-600">Verified Cash:</span>
                    <span className="font-bold text-slate-900 tabular-nums">₹{(data.before_state.verified_cash / 100000).toFixed(2)}L</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-lg bg-white border border-[#E4E6E0]">
                    <span className="text-slate-600">Cash At Risk:</span>
                    <span className="font-bold text-rose-700 tabular-nums">₹{data.before_state.cash_at_risk.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-lg bg-white border border-[#E4E6E0]">
                    <span className="text-slate-600">Close Readiness:</span>
                    <span className="font-bold text-amber-700 tabular-nums">{data.before_state.close_readiness_pct}%</span>
                  </div>
                </div>
              </div>

              {/* AFTER STATE CARD (SIMULATED) */}
              <div className="p-5 rounded-xl bg-emerald-50/40 border border-emerald-200 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                  <span className="text-xs font-heading font-bold uppercase tracking-wider text-emerald-800">
                    Simulated Outcome (After)
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${data.is_close_unlocked
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold"
                      : "bg-indigo-50 text-[#3730A3] border-indigo-200 font-bold"
                    }`}>
                    {data.after_state.close_decision.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between p-2.5 rounded-lg bg-white border border-emerald-200">
                    <span className="text-slate-700">Verified Cash:</span>
                    <span className="font-bold text-emerald-800 tabular-nums">₹{(data.after_state.verified_cash / 100000).toFixed(2)}L</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-lg bg-white border border-emerald-200">
                    <span className="text-slate-700">Cash At Risk:</span>
                    <span className="font-bold text-emerald-800 tabular-nums">
                      ₹{data.after_state.cash_at_risk.toLocaleString("en-IN", { minimumFractionDigits: 2 })}{" "}
                      <span className="text-[10px] text-emerald-700 font-medium">(-{data.risk_reduction_pct}%)</span>
                    </span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-lg bg-white border border-emerald-200">
                    <span className="text-slate-700">Close Readiness:</span>
                    <span className="font-bold text-emerald-800 tabular-nums">
                      {data.after_state.close_readiness_pct}% (+{data.readiness_delta_pct}%)
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* AI Impact Callout */}
            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-start space-x-3.5">
              <Sparkles className="w-5 h-5 text-[#3730A3] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-[#3730A3]">
                  CFO Decision Impact
                </h4>
                <p className="mt-1 text-xs text-slate-800 leading-relaxed">{data.ai_impact_narrative}</p>
              </div>
            </div>

          </div>
        ) : null}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E4E6E0]">
          <button
            onClick={onClose}
            className="min-h-[44px] px-5 py-2 text-xs font-semibold rounded-xl bg-white border border-[#D9DCD4] text-slate-700 hover:bg-[#F1F2EE] transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleApplyResolution}
            disabled={applying || !data}
            className="min-h-[44px] flex items-center space-x-2 px-6 py-2.5 text-xs font-semibold rounded-xl bg-[#3730A3] hover:bg-[#312E81] text-white transition-all disabled:opacity-50 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{applying ? "Applying..." : "Apply Resolution & Update Close"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
