"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  ShieldCheck,
  Cpu,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Layers,
  Scale
} from "lucide-react";
import { api, ReliabilityMetrics } from "@/lib/api";

interface ReliabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReliabilityModal({ isOpen, onClose }: ReliabilityModalProps) {
  const [data, setData] = useState<ReliabilityMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getReliabilityMatrix()
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 text-white shadow-lg shadow-emerald-500/20">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">AI vs Deterministic Rules Matrix</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Proof of "Deterministic First. AI Second. Human Last." operational policy
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
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
            <p className="text-sm text-slate-400">Auditing decision authority distribution...</p>
          </div>
        ) : data ? (
          <div className="my-6 space-y-6 overflow-y-auto pr-1">
            
            {/* 3 Authority Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Deterministic */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/40 space-y-2">
                <div className="flex items-center space-x-1.5 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Deterministic</span>
                </div>
                <h3 className="text-2xl font-bold text-white">{data.deterministic_decisions_pct}%</h3>
                <p className="text-[11px] text-slate-400">Exact UTR & bank statement arithmetic match</p>
              </div>

              {/* AI-Assisted */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/40 space-y-2">
                <div className="flex items-center space-x-1.5 text-indigo-400">
                  <Cpu className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">AI-Assisted</span>
                </div>
                <h3 className="text-2xl font-bold text-white">{data.ai_assisted_decisions_pct}%</h3>
                <p className="text-[11px] text-slate-400">Fuzzy narration regex & precedent clustering</p>
              </div>

              {/* Human Escalation */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/40 space-y-2">
                <div className="flex items-center space-x-1.5 text-amber-400">
                  <UserCheck className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Human Triage</span>
                </div>
                <h3 className="text-2xl font-bold text-white">{data.human_escalations_pct}%</h3>
                <p className="text-[11px] text-slate-400">Ambiguous disputes & unlisted deductions</p>
              </div>

            </div>

            {/* Visual Distribution Bar */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Execution Authority Distribution
              </span>
              <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
                <div
                  style={{ width: `${data.deterministic_decisions_pct}%` }}
                  className="bg-emerald-500 h-full transition-all"
                  title="Deterministic Rules"
                />
                <div
                  style={{ width: `${data.ai_assisted_decisions_pct}%` }}
                  className="bg-indigo-500 h-full transition-all"
                  title="AI-Assisted"
                />
                <div
                  style={{ width: `${data.human_escalations_pct}%` }}
                  className="bg-amber-500 h-full transition-all"
                  title="Human Triage"
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> <span>Deterministic ({data.deterministic_decisions_pct}%)</span></span>
                <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span> <span>AI ({data.ai_assisted_decisions_pct}%)</span></span>
                <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span> <span>Human ({data.human_escalations_pct}%)</span></span>
              </div>
            </div>

            {/* Core Principle Callout */}
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-700/40 text-xs text-indigo-200 leading-relaxed">
              <strong className="text-white block mb-0.5">Fintech Safety Bar:</strong>
              Arithmetic, ledger postings, and bank statement verification are executed 100% deterministically. LLM intelligence is strictly constrained to explaining variances, querying historical precedents, and drafting resolution proposals for controller review.
            </div>

          </div>
        ) : null}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            Total Reconciled Records: <strong className="text-white">{data?.total_reconciled || 142}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-all cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
