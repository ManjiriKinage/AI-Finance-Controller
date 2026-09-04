"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  RefreshCw,
  Scale,
  Sparkles,
  Layers
} from "lucide-react";
import { api, DecisionGateResponse } from "@/lib/api";

interface DecisionGateModalProps {
  resultId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DecisionGateModal({ resultId, isOpen, onClose }: DecisionGateModalProps) {
  const [data, setData] = useState<DecisionGateResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && resultId) {
      setLoading(true);
      api.getDecisionGate(resultId)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen, resultId]);

  if (!isOpen) return null;

  const gateIcons = {
    VERIFIED: <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />,
    CLEARED: <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />,
    WARNING: <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />,
    DISCREPANCY: <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-500 text-white shadow-lg shadow-indigo-500/20">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Why This Match Decision?</h2>
                <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-slate-800 text-indigo-300 border border-indigo-500/30 rounded-full">
                  Record #{resultId}
                </span>
                {data && (
                  <span className="px-2 py-0.5 text-xs font-mono text-slate-400 bg-slate-950 rounded-md border border-slate-800">
                    {data.lineage_id}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-gate deterministic audit checklist & 5.0% candidate safety margin verification
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
            <p className="text-sm text-slate-400">Evaluating 6 deterministic gates and safety margin against ledger...</p>
          </div>
        ) : data ? (
          <div className="my-6 space-y-5 overflow-y-auto pr-1">
            
            {/* Decision Determination Banner */}
            <div className={`p-4 rounded-2xl border flex items-start space-x-3.5 ${
              data.match_status === "MATCHED"
                ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
                : "bg-rose-950/30 border-rose-600/40 text-rose-200"
            }`}>
              {data.match_status === "MATCHED" ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Final Status: {data.match_status} ({data.match_score}% Score)
                  </h4>
                  <span className="text-xs font-mono font-bold text-slate-400">{data.matching_method}</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{data.decision_verdict}</p>
              </div>
            </div>

            {/* 6 Deterministic Gates Checklist */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Deterministic Policy Audit Checklist (6 Gates)
              </span>

              {data.gates.map((gate, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start space-x-2.5">
                    <div className="mt-0.5">{gateIcons[gate.status as keyof typeof gateIcons] || <CheckCircle2 className="w-4 h-4 text-emerald-400" />}</div>
                    <div>
                      <span className="text-xs font-bold text-white block">{gate.gate_name}</span>
                      <span className="text-[11px] text-slate-400">{gate.detail}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase border ${
                    gate.status === "VERIFIED" || gate.status === "CLEARED"
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                  }`}>
                    {gate.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Safety Policy */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-850 text-xs text-slate-300 font-mono">
              <strong className="text-indigo-400 block font-sans mb-0.5">Enforced Policy:</strong>
              <code>{data.safety_policy}</code>
            </div>

          </div>
        ) : null}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            Method: <strong className="text-white">{data?.matching_method || "EXACT_UTR"}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-all cursor-pointer"
          >
            Close Gate Audit
          </button>
        </div>

      </div>
    </div>
  );
}
