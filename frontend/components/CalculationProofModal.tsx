"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Calculator,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import { api, CalculationProofResponse } from "@/lib/api";

interface CalculationProofModalProps {
  settlementId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CalculationProofModal({ settlementId, isOpen, onClose }: CalculationProofModalProps) {
  const [data, setData] = useState<CalculationProofResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && settlementId) {
      setLoading(true);
      api.getCalculationProof(settlementId)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen, settlementId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white border border-[#E4E6E0] p-6 sm:p-8 shadow-none overflow-hidden max-h-[92vh] flex flex-col justify-between space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E4E6E0]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-[#3730A3] border border-indigo-100">
              <Calculator className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
                  Calculation Proof & Math Audit
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-mono font-medium bg-[#F5F6F3] text-slate-700 border border-[#E4E6E0] rounded-lg">
                  {settlementId}
                </span>
                {data && (
                  <span className="px-2 py-0.5 text-xs font-mono text-slate-500 bg-[#F5F6F3] rounded-md border border-[#E4E6E0]">
                    {data.lineage_id}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Exact line-item arithmetic proving Gross Inflow ⟷ Refunds ⟷ MDR Fees ⟷ GST ⟷ Net Variance
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
            <p className="text-sm text-slate-500">Computing decimal-level formula arithmetic...</p>
          </div>
        ) : data ? (
          <div className="my-2 space-y-5 overflow-y-auto pr-1">

            {/* Formula Banner */}
            <div className="p-3.5 rounded-xl bg-[#F5F6F3] border border-[#E4E6E0] font-mono text-xs text-[#3730A3] overflow-x-auto">
              <code>{data.formula_string}</code>
            </div>

            {/* Line-Item Calculation Steps */}
            <div className="space-y-2">
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-slate-600 block mb-1">
                Exact Arithmetic Breakdown
              </span>

              {data.proof_steps.map((step, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${step.operator === "VARIANCE"
                      ? step.amount > 0
                        ? "bg-rose-50 border-rose-200 text-rose-800"
                        : "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : step.operator === "EQUALS"
                        ? "bg-indigo-50/50 border-indigo-200 text-slate-900 font-semibold"
                        : "bg-[#F5F6F3] border-[#E4E6E0] text-slate-800"
                    }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-6 h-6 rounded-lg bg-white border border-[#E4E6E0] flex items-center justify-center font-bold text-[11px] text-slate-700">
                      {step.operator === "ADD" ? "+" : step.operator === "SUBTRACT" ? "-" : "="}
                    </span>
                    <div>
                      <span className="font-heading font-bold block text-slate-900">{step.line_item}</span>
                      <span className="text-[10px] text-slate-500">{step.explanation}</span>
                    </div>
                  </div>

                  <div className="text-right font-mono font-bold text-sm tabular-nums">
                    {step.operator === "SUBTRACT" ? "-" : ""}₹{Math.abs(step.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>

            {/* Variance Attribution Callout */}
            <div className="p-4 rounded-xl bg-[#F5F6F3] border border-[#E4E6E0] flex items-start space-x-3 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block mb-0.5 font-heading">Attribution Determination:</strong>
                <p className="text-slate-700 leading-relaxed">{data.attribution_reason}</p>
              </div>
            </div>

          </div>
        ) : null}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E4E6E0]">
          <div className="text-xs text-slate-500">
            Net Difference: <strong className={`font-semibold tabular-nums ${data?.variance === 0 ? "text-emerald-700" : "text-rose-700"}`}>₹{data?.variance.toFixed(2) || "0.00"}</strong>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] px-6 py-2.5 text-xs font-semibold rounded-xl bg-[#3730A3] hover:bg-[#312E81] text-white transition-all cursor-pointer"
          >
            Close Proof
          </button>
        </div>

      </div>
    </div>
  );
}
