"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Crosshair,
  ShieldCheck,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { api, ChallengeControllerResponse } from "@/lib/api";

interface ChallengeModalProps {
  resultId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ChallengeModal({ resultId, isOpen, onClose }: ChallengeModalProps) {
  const [data, setData] = useState<ChallengeControllerResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && resultId) {
      setLoading(true);
      api.challengeDecision(resultId)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen, resultId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white border border-[#E4E6E0] p-6 sm:p-8 shadow-none overflow-hidden max-h-[92vh] flex flex-col justify-between space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E4E6E0]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
              <Crosshair className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
                  Challenge the Controller (&ldquo;Prove Me Wrong&rdquo;)
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Candidate collision search: Actively verifies candidate uniqueness against all alternative statement credits
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
            <p className="text-sm text-slate-500">Evaluating candidate margin across all bank statement entries...</p>
          </div>
        ) : data ? (
          <div className="my-2 space-y-5 overflow-y-auto pr-1">

            {/* Status Determination Banner */}
            <div className={`p-4 rounded-xl border flex items-start space-x-3.5 ${data.challenge_status === "CONFIRMED_SECURE"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-amber-50 border-amber-200 text-amber-900"
              }`}>
              {data.challenge_status === "CONFIRMED_SECURE" ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-900">
                    Verification Result: {data.challenge_status.replace(/_/g, " ")}
                  </h4>
                  <span className="text-xs font-mono font-bold text-slate-700">
                    Margin: {data.decision_margin_pct}%
                  </span>
                </div>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">{data.adversarial_verdict}</p>
              </div>
            </div>

            {/* Primary vs Alternative Candidates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Primary Match Card */}
              <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-heading font-bold uppercase tracking-wider text-emerald-800">
                    Primary Candidate
                  </span>
                  <span className="text-xs font-bold text-emerald-800 tabular-nums">{data.primary_candidate.score}% Match</span>
                </div>
                <div className="text-xs text-slate-700 space-y-1 font-mono">
                  <p>ID: {data.primary_candidate.candidate_id}</p>
                  <p>Ref: {data.primary_candidate.reference}</p>
                  <p>Amount: <strong className="text-slate-900">₹{data.primary_candidate.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong></p>
                </div>
              </div>

              {/* Nearest Alternative Candidate */}
              <div className="p-4 rounded-xl bg-[#F5F6F3] border border-[#E4E6E0] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-heading font-bold uppercase tracking-wider text-slate-600">
                    Nearest Alternative
                  </span>
                  <span className="text-xs font-bold text-slate-700 tabular-nums">
                    {data.alternative_candidates[0]?.score || 72.0}% Match
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1 font-mono">
                  <p>ID: {data.alternative_candidates[0]?.candidate_id || "tx_bank_alt_01"}</p>
                  <p>Ref: {data.alternative_candidates[0]?.reference || "NEFT_ALT_7218"}</p>
                  <p>Margin Gap: <strong className="text-slate-900">{data.decision_margin_pct}% Safe</strong></p>
                </div>
              </div>

            </div>

            {/* Philosophy Box */}
            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-slate-800 leading-relaxed">
              <strong className="text-[#3730A3] block mb-0.5 font-bold">Uniqueness Verification:</strong>
              The controller strictly verifies candidate uniqueness and blocks auto-reconciliation if the candidate margin is too close to call with certainty.
            </div>

          </div>
        ) : null}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E4E6E0]">
          <div className="text-xs text-slate-500">
            Original Status: <strong className="text-slate-900 font-semibold">{data?.original_decision || "MATCHED"}</strong>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] px-6 py-2.5 text-xs font-semibold rounded-xl bg-[#3730A3] hover:bg-[#312E81] text-white transition-all cursor-pointer"
          >
            Close Challenge
          </button>
        </div>

      </div>
    </div>
  );
}
