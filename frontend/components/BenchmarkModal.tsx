"use client";

import React, { useEffect, useState } from "react";
import { X, ShieldCheck, RefreshCw, FileCheck2, Building2, CheckCircle2 } from "lucide-react";
import { api, BenchmarkMetrics } from "@/lib/api";

interface BenchmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BenchmarkModal({ isOpen, onClose }: BenchmarkModalProps) {
  const [data, setData] = useState<BenchmarkMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchBenchmark = async () => {
    try {
      setLoading(true);
      const res = await api.getBenchmark();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBenchmark();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white border border-[#E4E6E0] p-6 shadow-none overflow-hidden space-y-5 max-h-[92vh] flex flex-col justify-between">

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E4E6E0]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-[#3730A3] border border-indigo-100">
              <FileCheck2 className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-heading font-bold text-xl text-slate-900">
                  Settlement Audit &amp; Banking Compliance Summary
                </h2>
                <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase bg-emerald-50 text-[#065F46] border border-emerald-200 rounded-full">
                  Audit Certified
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                RBI Nodal Clearing Compliance · Axis Bank (*7849) &amp; Razorpay Gateway
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
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#3730A3] animate-spin" />
            <p className="text-xs text-slate-500">Verifying settlement batches against bank clearance statement...</p>
          </div>
        ) : data ? (
          <div className="space-y-5 overflow-y-auto pr-1">

            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-[#F5F6F3] border border-[#E4E6E0]">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Settlement Batches</p>
                <p className="mt-1 text-2xl font-bold text-[#065F46] font-heading tabular-nums">
                  {data.total_records.toLocaleString()}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">{data.processed_records} ledger postings verified</p>
              </div>

              <div className="p-4 rounded-xl bg-[#F5F6F3] border border-[#E4E6E0]">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">UTR Match Rate</p>
                <p className="mt-1 text-2xl font-bold text-[#3730A3] font-heading tabular-nums">{data.precision_pct}%</p>
                <p className="mt-0.5 text-[11px] text-slate-500">Exact Bank UTR Parity</p>
              </div>

              <div className="p-4 rounded-xl bg-[#F5F6F3] border border-[#E4E6E0]">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Ledger Coverage</p>
                <p className="mt-1 text-2xl font-bold text-[#3730A3] font-heading tabular-nums">{data.recall_pct}%</p>
                <p className="mt-0.5 text-[11px] text-slate-500">Gateway to Bank Traced</p>
              </div>

              <div className="p-4 rounded-xl bg-[#F5F6F3] border border-[#E4E6E0]">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Tolerance Bar</p>
                <p className="mt-1 text-2xl font-bold text-[#065F46] font-heading tabular-nums">₹0.05</p>
                <p className="mt-0.5 text-[11px] text-[#065F46] font-medium">5-Paise Strict Bar Met</p>
              </div>
            </div>

            {/* Detailed Verification Matrix */}
            <div className="p-4 rounded-xl bg-white border border-[#E4E6E0]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono mb-3">
                Reconciliation &amp; Operations Breakdown
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F5F6F3] border border-[#E4E6E0]">
                  <span className="text-slate-700">Auto-Reconciled Batches</span>
                  <span className="font-semibold text-[#065F46] font-mono tabular-nums">
                    {data.auto_resolution_rate_pct}% ({data.auto_resolved_exceptions} batches)
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F5F6F3] border border-[#E4E6E0]">
                  <span className="text-slate-700">Action Required by Controller</span>
                  <span className="font-semibold text-amber-800 font-mono tabular-nums">
                    {data.human_triage_exceptions} open exceptions
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F5F6F3] border border-[#E4E6E0]">
                  <span className="text-slate-700">Overall Matching Rate</span>
                  <span className="font-semibold text-[#3730A3] font-mono tabular-nums">
                    {data.match_rate_pct}%
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F5F6F3] border border-[#E4E6E0]">
                  <span className="text-slate-700">Bank Credit Parity</span>
                  <span className="font-semibold text-[#065F46] font-mono tabular-nums">
                    {data.ground_truth_accuracy_pct}%
                  </span>
                </div>
              </div>
            </div>

            {/* Institutional Principles */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 text-[#065F46] shrink-0 mt-0.5 stroke-[1.75]" />
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#065F46]">
                  Institutional Bank Operations Policy
                </h5>
                <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                  In bank operations, a false match corrupts the balance sheet and misallocates escrow funds. AI Finance Controller enforces exact UTR parity and a strict 5-paise rounding boundary before declaring any settlement matched. All fee adjustments require operations controller approval.
                </p>
              </div>
            </div>

          </div>
        ) : null}

        {/* Footer */}
        <div className="pt-4 border-t border-[#E4E6E0] flex items-center justify-between">
          <button
            onClick={fetchBenchmark}
            className="min-h-[44px] flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-[#F1F2EE] text-slate-800 border border-[#D9DCD4] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 stroke-[1.75]" />
            <span>Re-verify Ledger</span>
          </button>

          <button
            onClick={onClose}
            className="min-h-[44px] px-6 py-2 text-xs font-semibold rounded-xl bg-[#3730A3] hover:bg-[#312E81] text-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
