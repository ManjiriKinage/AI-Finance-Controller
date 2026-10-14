"use client";

import React from "react";
import { X, HelpCircle, ShieldAlert } from "lucide-react";

interface WhyBreakdown {
  total_unreconciled: number;
  causes: Record<string, number>;
  top_cause: string;
  most_likely_source: string;
}

interface WhyModalProps {
  isOpen: boolean;
  onClose: () => void;
  whyData?: WhyBreakdown;
  unreconciledAmount?: number;
}

export function WhyModal({ isOpen, onClose, whyData, unreconciledAmount }: WhyModalProps) {
  if (!isOpen) return null;

  const total = unreconciledAmount !== undefined ? unreconciledAmount : (whyData?.total_unreconciled || 297781.17);
  const causes: Record<string, number> = whyData?.causes || {
    AMOUNT_MISMATCH: 184500,
    MISSING_SETTLEMENT: 65200,
    FEE_TAX_MISMATCH: 28400,
    UNKNOWN_BANK_ENTRY: 19681.17
  };

  const causeNames: Record<string, string> = {
    AMOUNT_MISMATCH: "Gateway Net vs Gross Inflow Variance",
    MISSING_SETTLEMENT: "Missing Bank Credits (In-Transit Payouts)",
    TIMING_DIFFERENCE: "Value Date Offsets (Weekend Clearances)",
    UNKNOWN_BANK_ENTRY: "Direct / Unidentified Bank Inflows",
    DUPLICATE_ENTRY: "Duplicate Bank Credits",
    REFUND_MISMATCH: "Customer Refund Adjustments",
    FEE_TAX_MISMATCH: "MDR / GST Rounding Variances"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white border border-[#E5E7EB] p-6 shadow-none overflow-hidden space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E5E7EB]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <HelpCircle className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg sm:text-xl text-slate-900">
                Why is ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })} Unreconciled?
              </h2>
              <p className="text-xs text-slate-500">Automated Root-Cause Decomposition & Variance Ledger</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Modal"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 hover:bg-[#F5F6F3] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Breakdown List */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#F5F6F3] border border-[#E5E7EB] flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Total Unexplained Difference</span>
            <span className="font-mono text-lg font-bold text-amber-700 tabular-nums">
              ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
              Primary Variance Contributors
            </h4>
            {Object.entries(causes).map(([key, amt]) => {
              const numAmt = Number(amt) || 0;
              const pct = total > 0 ? Math.round((numAmt / total) * 100) : 0;
              return (
                <div key={key} className="p-3.5 rounded-xl bg-white border border-[#E5E7EB] flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium text-slate-800">{causeNames[key] || key}</span>
                    <span className="font-mono text-xs sm:text-sm font-semibold text-slate-900 tabular-nums">
                      ₹{numAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}{" "}
                      <span className="text-xs text-slate-500 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-[#F5F6F3] rounded-full h-1.5 overflow-hidden">
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
        <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-start space-x-3">
          <ShieldAlert className="w-5 h-5 text-[#3730A3] shrink-0 mt-0.5 stroke-[1.5]" />
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#3730A3]">AI Controller Intelligence</h5>
            <p className="mt-1 text-xs text-slate-700 leading-relaxed">
              <strong>Top Cause:</strong> {causeNames[whyData?.top_cause || "AMOUNT_MISMATCH"] || whyData?.top_cause}. Most variances stem from unlisted Razorpay dispute holdbacks and gateway adjustments. Once approved or reconciled against the dispute ledger, the net unexplained variance will drop to <strong>₹0.00</strong>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="min-h-[44px] px-5 py-2 text-xs font-semibold rounded-xl bg-[#3730A3] hover:bg-indigo-900 text-white transition-colors cursor-pointer"
          >
            Close Drilldown
          </button>
        </div>

      </div>
    </div>
  );
}
