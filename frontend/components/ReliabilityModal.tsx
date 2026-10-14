"use client";

import React, { useEffect, useState } from "react";
import { X, ShieldCheck, Cpu, UserCheck, RefreshCw, Scale } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white border border-[#E4E6E0] p-6 sm:p-8 shadow-none overflow-hidden max-h-[92vh] flex flex-col justify-between">

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E4E6E0]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-[#3730A3] border border-indigo-100">
              <Scale className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
                Reconciliation Governance Architecture
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated Clearing Rules with Human-in-the-Loop Operations Sign-off
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
            <p className="text-sm text-slate-500">Auditing decision authority distribution...</p>
          </div>
        ) : data ? (
          <div className="my-2 space-y-6 overflow-y-auto pr-1">

            {/* 3 Authority Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

              {/* Rule-Engine */}
              <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-emerald-800">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[11px] font-heading font-bold uppercase tracking-wider">Rule-Verified</span>
                </div>
                <h3 className="text-2xl font-heading font-bold text-slate-900 tabular-nums">{data.deterministic_decisions_pct}%</h3>
                <p className="text-[11px] text-slate-600">Exact UTR & bank statement arithmetic match</p>
              </div>

              {/* AI-Assisted Diagnostics */}
              <div className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-200 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-[#3730A3]">
                  <Cpu className="w-4 h-4" />
                  <span className="text-[11px] font-heading font-bold uppercase tracking-wider">AI Diagnostics</span>
                </div>
                <h3 className="text-2xl font-heading font-bold text-slate-900 tabular-nums">{data.ai_assisted_decisions_pct}%</h3>
                <p className="text-[11px] text-slate-600">Variance decomposition & precedent clustering</p>
              </div>

              {/* Human Escalation */}
              <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-200 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-amber-800">
                  <UserCheck className="w-4 h-4" />
                  <span className="text-[11px] font-heading font-bold uppercase tracking-wider">Controller Action</span>
                </div>
                <h3 className="text-2xl font-heading font-bold text-slate-900 tabular-nums">{data.human_escalations_pct}%</h3>
                <p className="text-[11px] text-slate-600">Disputed bank entries & fee adjustments</p>
              </div>

            </div>

            {/* Visual Distribution Bar */}
            <div className="space-y-2">
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-slate-600 block">
                Operational Authority Distribution
              </span>
              <div className="h-4 w-full bg-[#F5F6F3] rounded-full overflow-hidden flex border border-[#E4E6E0]">
                <div
                  style={{ width: `${data.deterministic_decisions_pct}%` }}
                  className="bg-emerald-600 h-full transition-all"
                  title="Rule-Verified Matches"
                />
                <div
                  style={{ width: `${data.ai_assisted_decisions_pct}%` }}
                  className="bg-[#3730A3] h-full transition-all"
                  title="AI Diagnostics"
                />
                <div
                  style={{ width: `${data.human_escalations_pct}%` }}
                  className="bg-amber-600 h-full transition-all"
                  title="Controller Approval"
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-600 pt-1">
                <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span> <span>Rule-Verified ({data.deterministic_decisions_pct}%)</span></span>
                <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-[#3730A3] inline-block"></span> <span>AI Diagnostics ({data.ai_assisted_decisions_pct}%)</span></span>
                <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-amber-600 inline-block"></span> <span>Controller Action ({data.human_escalations_pct}%)</span></span>
              </div>
            </div>

            {/* Core Principle Callout */}
            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-slate-800 leading-relaxed">
              <strong className="text-[#3730A3] block mb-0.5 font-bold">Institutional Governance Policy:</strong>
              Automated rules strictly verify mathematical equality down to 5 paise. AI models are constrained to explaining discrepancies and drafting audit recommendations. Operations controllers retain final sign-off authority for all ledger adjustments.
            </div>

          </div>
        ) : null}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E4E6E0]">
          <div className="text-xs text-slate-500 font-medium">
            Status: <span className="text-emerald-700 font-semibold">Governance Enforced</span>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] px-6 py-2.5 text-xs font-semibold rounded-xl bg-[#3730A3] hover:bg-[#312E81] text-white transition-all cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
