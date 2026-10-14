"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Scale
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
    VERIFIED: <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />,
    CLEARED: <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />,
    WARNING: <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />,
    DISCREPANCY: <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white border border-[#E4E6E0] p-6 sm:p-8 shadow-none overflow-hidden max-h-[92vh] flex flex-col justify-between">

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E4E6E0]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-[#3730A3] border border-indigo-100">
              <Scale className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
                  3-Way Reconciliation Audit Gate
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-mono font-medium bg-[#F5F6F3] text-slate-700 border border-[#E4E6E0] rounded-lg">
                  Record #{resultId}
                </span>
                {data && (
                  <span className="px-2 py-0.5 text-xs font-mono text-slate-500 bg-[#F5F6F3] rounded-md border border-[#E4E6E0]">
                    {data.lineage_id}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Bank clearance verification, value-date checking, and UTR reconciliation audit
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
            <p className="text-sm text-slate-500">Evaluating 6 bank clearance verification gates against ledger...</p>
          </div>
        ) : data ? (
          <div className="my-6 space-y-5 overflow-y-auto pr-1">

            {/* Decision Determination Banner */}
            <div className={`p-4 rounded-xl border flex items-start space-x-3.5 ${data.match_status === "MATCHED"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-rose-50 border-rose-200 text-rose-900"
              }`}>
              {data.match_status === "MATCHED" ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-900">
                    Final Status: {data.match_status} ({data.match_score}% Score)
                  </h4>
                  <span className="text-xs font-mono font-bold text-slate-600">{data.matching_method}</span>
                </div>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">{data.decision_verdict}</p>
              </div>
            </div>

            {/* 6 Verification Gates Checklist */}
            <div className="space-y-2">
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Institutional Bank Clearance Checklist (6 Gates)
              </span>

              {data.gates.map((gate, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#F5F6F3] border border-[#E4E6E0] flex items-start justify-between gap-3"
                >
                  <div className="flex items-start space-x-2.5">
                    <div className="mt-0.5">{gateIcons[gate.status as keyof typeof gateIcons] || <CheckCircle2 className="w-4 h-4 text-emerald-600" />}</div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{gate.gate_name}</span>
                      <span className="text-[11px] text-slate-600">{gate.detail}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase border ${gate.status === "VERIFIED" || gate.status === "CLEARED"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                    {gate.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Safety Policy */}
            <div className="p-3.5 rounded-xl bg-[#F5F6F3] border border-[#E4E6E0] text-xs text-slate-700 font-mono">
              <strong className="text-[#3730A3] block font-sans mb-0.5 font-bold">Enforced Banking Policy:</strong>
              <code>{data.safety_policy}</code>
            </div>

          </div>
        ) : null}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E4E6E0]">
          <div className="text-xs text-slate-500">
            Method: <strong className="text-slate-900 font-semibold">{data?.matching_method || "EXACT_UTR"}</strong>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] px-6 py-2.5 text-xs font-semibold rounded-xl bg-[#3730A3] hover:bg-[#312E81] text-white transition-all cursor-pointer"
          >
            Close Audit Gate
          </button>
        </div>

      </div>
    </div>
  );
}
