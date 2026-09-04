"use client";

import React, { useState } from "react";
import {
  X,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Clock,
  Sparkles,
  Check,
  Send
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
    HIGH: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    MEDIUM: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    LOW: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
  };

  const statusBadges = {
    OPEN: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    UNDER_REVIEW: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    RESOLVED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    REJECTED: "bg-rose-500/15 text-rose-400 border-rose-500/30"
  };

  const explanation = exception.ai_explanation;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
        
        {/* Top Header */}
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold text-white">{exception.id}</h3>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${severityBadges[exception.severity]}`}>
                    {exception.severity} Priority
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${statusBadges[exception.status]}`}>
                    {exception.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{exception.exception_type.replace(/_/g, " ")}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Financial Figures Card */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Expected</p>
                <p className="mt-1 text-base font-bold text-white">
                  ₹{exception.expected_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Bank Credit</p>
                <p className="mt-1 text-base font-bold text-slate-200">
                  ₹{exception.actual_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Variance</p>
                <p className="mt-1 text-base font-bold text-rose-400">
                  ₹{exception.difference.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* AI Evidence & Analysis Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-700/40 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-indigo-900/60">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">Evidence-Backed AI Analysis</h4>
                </div>
                <span className="px-2 py-0.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                  {exception.confidence}% Confidence
                </span>
              </div>

              <div className="mt-3 space-y-2">
                <p className="text-xs text-slate-300">
                  <strong className="text-white">Likely Cause:</strong> {explanation?.likely_cause || "Unexplained variance between gateway settlement batch and bank credit posting."}
                </p>
              </div>

              {/* Evidence Checklist */}
              {explanation?.evidence && explanation.evidence.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h5 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Verified Evidence Points:</h5>
                  <div className="space-y-1.5">
                    {explanation.evidence.map((ev, idx) => (
                      <div key={idx} className="flex items-start space-x-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                        {ev.status === "VERIFIED" && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />}
                        {ev.status === "DISCREPANCY" && <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />}
                        {ev.status === "WARNING" && <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />}
                        {ev.status === "INFO" && <HelpCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />}
                        <div>
                          <span className="font-semibold text-slate-200">{ev.factor}: </span>
                          <span className="text-slate-400">{ev.detail}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Action */}
              <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                <span className="text-indigo-400 font-semibold uppercase tracking-wider text-[10px] block mb-1">Recommended Operation:</span>
                <p className="text-slate-300">{exception.recommended_action || explanation?.recommended_action || "Review gateway adjustment details."}</p>
              </div>
            </div>

            {/* Resolution Notes Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Audit Notes / Reason (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Verified with Razorpay settlement adjustment log. Difference booked to Gateway Fee Variance."
                rows={2}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/90 space-y-2">
          {exception.status === "OPEN" || exception.status === "UNDER_REVIEW" ? (
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleAction("APPROVE_ADJUSTMENT")}
                disabled={loading}
                className="flex items-center justify-center space-x-1.5 px-3 py-2.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approve Adj</span>
              </button>

              <button
                onClick={() => handleAction("MARK_DISPUTED")}
                disabled={loading}
                className="flex items-center justify-center space-x-1.5 px-3 py-2.5 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20 transition-all disabled:opacity-50"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Dispute / Hold</span>
              </button>

              <button
                onClick={() => handleAction("REJECT")}
                disabled={loading}
                className="flex items-center justify-center space-x-1.5 px-3 py-2.5 text-xs font-semibold rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white transition-all disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-center">
              <p className="text-xs font-semibold text-emerald-400">
                This exception has been marked {exception.status} by {exception.resolved_by || "Finance Ops"}.
              </p>
              {exception.resolution_notes && (
                <p className="text-[11px] text-slate-400 mt-1 italic">&ldquo;{exception.resolution_notes}&rdquo;</p>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
