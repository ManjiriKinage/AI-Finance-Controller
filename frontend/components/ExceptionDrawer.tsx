"use client";

import React, { useState } from "react";
import {
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Check
} from "lucide-react";
import { ExceptionItem, api } from "@/lib/api";

interface ExceptionDrawerProps {
  exception: ExceptionItem | null;
  onClose: () => void;
  onActionComplete: (updated: ExceptionItem) => void;
}

export function ExceptionDrawer({ exception, onClose, onActionComplete }: ExceptionDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");

  if (!exception) return null;

  const handleAction = async (action: string) => {
    try {
      setLoading(true);
      const updated = await api.takeExceptionAction(exception.id, action, notes || undefined);
      onActionComplete(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const severityBadges = {
    HIGH: "bg-rose-50 text-rose-700 border-rose-200",
    MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
    LOW: "bg-emerald-50 text-emerald-700 border-emerald-200"
  };

  const statusBadges = {
    OPEN: "bg-amber-50 text-amber-800 border-amber-200",
    UNDER_REVIEW: "bg-indigo-50 text-[#3730A3] border-indigo-200",
    RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    REJECTED: "bg-rose-50 text-rose-700 border-rose-200"
  };

  const explanation = exception.ai_explanation;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="w-full max-w-xl bg-white border-l border-[#E4E6E0] h-full shadow-none flex flex-col justify-between overflow-y-auto">

        {/* Top Header */}
        <div>
          <div className="p-6 border-b border-[#E4E6E0] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-[#3730A3] border border-indigo-100">
                <AlertTriangle className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-heading font-bold text-lg text-slate-900">{exception.id}</h3>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${severityBadges[exception.severity]}`}>
                    {exception.severity} Priority
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${statusBadges[exception.status]}`}>
                    {exception.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{exception.exception_type.replace(/_/g, " ")}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close Drawer"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-[#E4E6E0] text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[1.75]" />
            </button>
          </div>

          {/* Financial Figures Card */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-[#F5F6F3] border border-[#E4E6E0]">
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Expected</p>
                <p className="mt-1 text-base font-bold text-slate-900 tabular-nums font-heading">
                  ₹{exception.expected_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Bank Credit</p>
                <p className="mt-1 text-base font-bold text-slate-900 tabular-nums font-heading">
                  ₹{exception.actual_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Variance</p>
                <p className="mt-1 text-base font-bold text-rose-700 tabular-nums font-heading">
                  ₹{exception.difference.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* AI Evidence & Analysis Box */}
            <div className="p-5 rounded-2xl bg-white border border-[#E4E6E0] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E4E6E0]">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#3730A3] stroke-[1.75]" />
                  <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-900">
                    Evidence-Backed AI Analysis
                  </h4>
                </div>
                <span className="px-2 py-0.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full tabular-nums">
                  {exception.confidence}% Confidence
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong className="text-slate-900">Likely Cause:</strong> {explanation?.likely_cause || "Unexplained variance between gateway settlement batch and bank credit posting."}
                </p>
              </div>

              {/* Evidence Checklist */}
              {explanation?.evidence && explanation.evidence.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Verified Evidence Points:</h5>
                  <div className="space-y-1.5">
                    {explanation.evidence.map((ev, idx) => (
                      <div key={idx} className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-[#F5F6F3] border border-[#E4E6E0] text-xs">
                        {ev.status === "VERIFIED" && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />}
                        {ev.status === "DISCREPANCY" && <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />}
                        {ev.status === "WARNING" && <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />}
                        {ev.status === "INFO" && <HelpCircle className="w-4 h-4 text-[#3730A3] flex-shrink-0 mt-0.5" />}
                        <div>
                          <span className="font-semibold text-slate-900">{ev.factor}: </span>
                          <span className="text-slate-600">{ev.detail}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Action */}
              <div className="mt-4 p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs">
                <span className="text-[#3730A3] font-bold uppercase tracking-wider text-[10px] block mb-1">
                  Recommended Operation:
                </span>
                <p className="text-slate-800 leading-relaxed">{exception.recommended_action || explanation?.recommended_action || "Review gateway adjustment details."}</p>
              </div>
            </div>

            {/* Resolution Notes Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Audit Notes / Reason (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Verified with Razorpay settlement adjustment log. Difference booked to Gateway Fee Variance."
                rows={2}
                className="w-full px-3 py-2 text-xs bg-[#F5F6F3] border border-[#E4E6E0] rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#3730A3] focus:bg-white transition-colors"
              />
            </div>

          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-6 border-t border-[#E4E6E0] bg-[#F5F6F3] space-y-2">
          {exception.status === "OPEN" || exception.status === "UNDER_REVIEW" ? (
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleAction("APPROVE_ADJUSTMENT")}
                disabled={loading}
                className="min-h-[44px] flex items-center justify-center space-x-1.5 px-3 py-2.5 text-xs font-semibold rounded-xl bg-[#3730A3] hover:bg-[#312E81] text-white transition-all disabled:opacity-50 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approve Adj</span>
              </button>

              <button
                onClick={() => handleAction("MARK_DISPUTED")}
                disabled={loading}
                className="min-h-[44px] flex items-center justify-center space-x-1.5 px-3 py-2.5 text-xs font-semibold rounded-xl bg-white hover:bg-amber-50 text-amber-800 border border-amber-200 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>Dispute / Hold</span>
              </button>

              <button
                onClick={() => handleAction("REJECT")}
                disabled={loading}
                className="min-h-[44px] flex items-center justify-center space-x-1.5 px-3 py-2.5 text-xs font-semibold rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 transition-all disabled:opacity-50 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <p className="text-xs font-semibold text-emerald-800">
                This exception has been marked {exception.status} by {exception.resolved_by || "Finance Ops"}.
              </p>
              {exception.resolution_notes && (
                <p className="text-[11px] text-slate-600 mt-1 italic">&ldquo;{exception.resolution_notes}&rdquo;</p>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
