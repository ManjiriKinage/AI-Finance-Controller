"use client";

import React from "react";
import { X, HelpCircle, AlertCircle, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";

interface WhyModalProps {
  isOpen: boolean;
  onClose: () => void;
  whyData?: {
    total_unreconciled: number;
    causes: Record<string, number>;
    top_cause: string;
    most_likely_source: string;
  };
}

export function WhyModal({ isOpen, onClose, whyData }: WhyModalProps) {
  if (!isOpen) return null;

  const total = whyData?.total_unreconciled || 10600.0;
  const causes = whyData?.causes || {
    AMOUNT_MISMATCH: 4500.0,
    MISSING_SETTLEMENT: 3200.0,
    TIMING_DIFFERENCE: 1900.0,
    UNKNOWN_BANK_ENTRY: 1000.0
  };

  const causeNames: Record<string, string> = {
    AMOUNT_MISMATCH: "Amount Mismatches (Fee / Risk Reserves)",
    MISSING_SETTLEMENT: "Missing Bank Credits (In-Transit Payouts)",
    TIMING_DIFFERENCE: "Value Date Offsets (Weekend Clearances)",
    UNKNOWN_BANK_ENTRY: "Direct / Unidentified Bank Inflows",
    DUPLICATE_ENTRY: "Duplicate Bank Credits",
    REFUND_MISMATCH: "Customer Refund Adjustments",
    FEE_TAX_MISMATCH: "MDR / GST Rounding Variances"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Why is ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })} Unreconciled?</h2>
              <p className="text-xs text-slate-400">Automated Root-Cause Decomposition & Variance Ledger</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Breakdown List */}
        <div className="mt-5 space-y-3">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">Total Unexplained Difference</span>
            <span className="text-lg font-bold text-amber-400">₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="space-y-2 mt-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Primary Variance Contributors</h4>
            {Object.entries(causes).map(([key, amt]) => {
              const pct = total > 0 ? Math.round((amt / total) * 100) : 0;
              return (
                <div key={key} className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{causeNames[key] || key}</span>
                    <span className="text-sm font-semibold text-slate-200">
                      ₹{amt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}{" "}
                      <span className="text-xs text-slate-400 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(5, pct))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Insight Box */}
        <div className="mt-5 p-4 rounded-xl bg-indigo-950/40 border border-indigo-700/40 flex items-start space-x-3">
          <ShieldAlert className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-indigo-300">AI Controller Intelligence</h5>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed">
              <strong>Top Cause:</strong> {causeNames[whyData?.top_cause || "AMOUNT_MISMATCH"] || whyData?.top_cause}. Most variances stem from unlisted Razorpay dispute holdbacks and gateway adjustments. Once approved or reconciled against the dispute ledger, the net unexplained variance will drop to <strong>₹0.00</strong>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-850 hover:bg-slate-800 text-white border border-slate-700 transition-all"
          >
            Close Drilldown
          </button>
        </div>

      </div>
    </div>
  );
}
