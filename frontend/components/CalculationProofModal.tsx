"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Minus,
  Plus,
  Equal
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-500 text-white shadow-lg shadow-indigo-500/20">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Calculation Proof & Math Audit</h2>
                <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-slate-800 text-indigo-300 border border-indigo-500/30 rounded-full">
                  {settlementId}
                </span>
                {data && (
                  <span className="px-2 py-0.5 text-xs font-mono text-slate-400 bg-slate-950 rounded-md border border-slate-800">
                    {data.lineage_id}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Exact line-item arithmetic proving Gross Inflow ⟷ Refunds ⟷ MDR Fees ⟷ GST ⟷ Net Variance
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

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-sm text-slate-400">Computing decimal-level formula arithmetic...</p>
          </div>
        ) : data ? (
          <div className="my-6 space-y-5 overflow-y-auto pr-1">
            
            {/* Formula Banner */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto">
              <code>{data.formula_string}</code>
            </div>

            {/* Line-Item Calculation Steps */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Deterministic Arithmetic Breakdown
              </span>

              {data.proof_steps.map((step, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                    step.operator === "VARIANCE"
                      ? step.amount > 0
                        ? "bg-rose-950/30 border-rose-600/40 text-rose-300"
                        : "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                      : step.operator === "EQUALS"
                      ? "bg-slate-900 border-indigo-500/40 text-white font-semibold"
                      : "bg-slate-950/70 border-slate-800 text-slate-300"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-[11px] text-slate-400">
                      {step.operator === "ADD" ? "+" : step.operator === "SUBTRACT" ? "-" : "="}
                    </span>
                    <div>
                      <span className="font-bold block">{step.line_item}</span>
                      <span className="text-[10px] text-slate-500">{step.explanation}</span>
                    </div>
                  </div>

                  <div className="text-right font-mono font-bold text-sm">
                    {step.operator === "SUBTRACT" ? "-" : ""}₹{Math.abs(step.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>

            {/* Variance Attribution Callout */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start space-x-3 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Attribution Determination:</strong>
                {data.attribution_reason}
              </div>
            </div>

          </div>
        ) : null}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            Net Difference: <strong className={data?.variance === 0 ? "text-emerald-400" : "text-rose-400"}>₹{data?.variance.toFixed(2) || "0.00"}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-all cursor-pointer"
          >
            Close Proof
          </button>
        </div>

      </div>
    </div>
  );
}
