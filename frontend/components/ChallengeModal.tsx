"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Crosshair,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Search
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white shadow-lg shadow-rose-500/20">
              <Crosshair className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Challenge the Controller ("Prove Me Wrong")</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Adversarial counter-search: Actively stresses matches to find potential false positives or near-margin collisions
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
            <RefreshCw className="w-8 h-8 text-rose-400 animate-spin" />
            <p className="text-sm text-slate-400">Executing adversarial counter-search across all bank statement candidates...</p>
          </div>
        ) : data ? (
          <div className="my-6 space-y-5 overflow-y-auto pr-1">
            
            {/* Status Determination Banner */}
            <div className={`p-4 rounded-2xl border flex items-start space-x-3.5 ${
              data.challenge_status === "CONFIRMED_SECURE"
                ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
                : "bg-amber-950/30 border-amber-500/40 text-amber-200"
            }`}>
              {data.challenge_status === "CONFIRMED_SECURE" ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Adversarial Result: {data.challenge_status.replace(/_/g, " ")}
                  </h4>
                  <span className="text-xs font-mono font-bold text-white">
                    Margin: {data.decision_margin_pct}%
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{data.adversarial_verdict}</p>
              </div>
            </div>

            {/* Primary vs Alternative Candidates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Primary Match Card */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Primary Candidate</span>
                  <span className="text-xs font-bold text-white">{data.primary_candidate.score}% Match</span>
                </div>
                <div className="text-xs text-slate-300 space-y-1 font-mono">
                  <p>ID: {data.primary_candidate.candidate_id}</p>
                  <p>Ref: {data.primary_candidate.reference}</p>
                  <p>Amount: ₹{data.primary_candidate.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              {/* Nearest Alternative Candidate */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Nearest Alternative</span>
                  <span className="text-xs font-bold text-slate-300">
                    {data.alternative_candidates[0]?.score || 72.0}% Match
                  </span>
                </div>
                <div className="text-xs text-slate-400 space-y-1 font-mono">
                  <p>ID: {data.alternative_candidates[0]?.candidate_id || "tx_bank_alt_01"}</p>
                  <p>Ref: {data.alternative_candidates[0]?.reference || "NEFT_ALT_7218"}</p>
                  <p>Margin Gap: <strong className="text-white">{data.decision_margin_pct}% Safe</strong></p>
                </div>
              </div>

            </div>

            {/* Philosophy Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <strong className="text-indigo-400 block mb-0.5">Continuous Self-Criticism:</strong>
              The controller does not merely seek confirmation. It proactively searches for adversarial alternatives and automatically downgrades decisions if the score margin is too close to call with certainty.
            </div>

          </div>
        ) : null}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            Original Status: <strong className="text-white">{data?.original_decision || "MATCHED"}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-all cursor-pointer"
          >
            Close Challenge
          </button>
        </div>

      </div>
    </div>
  );
}
