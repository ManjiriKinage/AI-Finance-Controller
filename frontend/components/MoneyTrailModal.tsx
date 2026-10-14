"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  CreditCard,
  Building2,
  Landmark,
  Layers,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  RefreshCw,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { api, MoneyTrailResponse, MoneyTrailNode } from "@/lib/api";

interface MoneyTrailModalProps {
  settlementId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MoneyTrailModal({ settlementId, isOpen, onClose }: MoneyTrailModalProps) {
  const [trail, setTrail] = useState<MoneyTrailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<MoneyTrailNode | null>(null);

  useEffect(() => {
    if (isOpen && settlementId) {
      setLoading(true);
      api.getMoneyTrail(settlementId)
        .then((res) => {
          setTrail(res);
          if (res.nodes && res.nodes.length > 0) {
            setSelectedNode(res.nodes[2] || res.nodes[0]); // Default to settlement node
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen, settlementId]);

  if (!isOpen) return null;

  const nodeIcons = {
    CUSTOMER: CreditCard,
    PAYMENT: Layers,
    SETTLEMENT: Building2,
    BANK: Landmark,
    LEDGER: BookOpen
  };

  const statusStyles = {
    VERIFIED: {
      border: "border-emerald-300",
      bg: "bg-emerald-50",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: "text-emerald-700",
      dot: "bg-emerald-500"
    },
    DISCREPANCY: {
      border: "border-rose-300",
      bg: "bg-rose-50",
      badge: "bg-rose-50 text-rose-700 border-rose-200",
      icon: "text-rose-700",
      dot: "bg-rose-500"
    },
    MISMATCH: {
      border: "border-rose-300",
      bg: "bg-rose-50",
      badge: "bg-rose-50 text-rose-700 border-rose-200",
      icon: "text-rose-700",
      dot: "bg-rose-500"
    },
    UNRESOLVED: {
      border: "border-amber-300",
      bg: "bg-amber-50",
      badge: "bg-amber-50 text-amber-700 border-amber-200",
      icon: "text-amber-700",
      dot: "bg-amber-500"
    },
    WARNING: {
      border: "border-indigo-300",
      bg: "bg-indigo-50",
      badge: "bg-indigo-50 text-[#3730A3] border-indigo-200",
      icon: "text-[#3730A3]",
      dot: "bg-[#3730A3]"
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-5xl rounded-2xl bg-white border border-[#E4E6E0] p-6 sm:p-8 shadow-none overflow-hidden max-h-[92vh] flex flex-col justify-between space-y-6">

        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E4E6E0]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-[#3730A3] border border-indigo-100">
              <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
                  Interactive Money Trail
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-mono font-medium bg-[#F5F6F3] text-slate-700 border border-[#E4E6E0] rounded-lg">
                  {trail?.settlement_id || settlementId}
                </span>
                {trail?.utr && (
                  <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                    UTR: {trail.utr}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-Node Financial Graph: Customer ⟷ Payment ⟷ Settlement ⟷ Bank Statement ⟷ Accounting Ledger
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
            <p className="text-sm text-slate-500">Tracing transaction graph across payment gateway and bank statement...</p>
          </div>
        ) : trail ? (
          <div className="my-2 space-y-6 overflow-y-auto pr-1">

            {/* Visual Node Flow Horizontal Stepper */}
            <div className="relative p-6 rounded-2xl bg-[#F5F6F3] border border-[#E4E6E0] overflow-x-auto">
              <div className="min-w-[700px] flex items-center justify-between relative">

                {/* Connecting Line */}
                <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-[#E4E6E0] -translate-y-1/2 z-0" />

                {trail.nodes.map((node) => {
                  const Icon = nodeIcons[node.step] || Layers;
                  const style = statusStyles[node.status] || statusStyles.VERIFIED;
                  const isSelected = selectedNode?.id === node.id;

                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className="relative z-10 flex flex-col items-center text-center cursor-pointer group"
                    >
                      {/* Node Circle */}
                      <div
                        className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all duration-200 ${style.border} ${style.bg} ${isSelected ? "scale-110 ring-2 ring-[#3730A3] ring-offset-2 ring-offset-white" : "group-hover:scale-105"
                          }`}
                      >
                        <Icon className={`w-6 h-6 ${style.icon}`} />
                      </div>

                      {/* Title & Amount */}
                      <span className="mt-2 text-xs font-heading font-bold text-slate-900 uppercase tracking-wider">{node.step}</span>
                      <span className="text-xs font-semibold text-slate-800 tabular-nums">
                        ₹{node.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                      <span className={`mt-1 px-2 py-0.5 text-[9px] font-bold uppercase rounded-full border ${style.badge}`}>
                        {node.badge_label}
                      </span>
                    </div>
                  );
                })}

              </div>
            </div>

            {/* Selected Node Deep Dive & Arithmetic Proofs */}
            {selectedNode && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Node Metadata Card */}
                <div className="p-5 rounded-xl bg-[#F5F6F3] border border-[#E4E6E0] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E4E6E0]">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#3730A3]">
                        Inspected Step: {selectedNode.step}
                      </span>
                      <h4 className="text-base font-heading font-bold text-slate-900">{selectedNode.title}</h4>
                    </div>
                    <span className="text-lg font-heading font-bold text-slate-900 tabular-nums">
                      ₹{selectedNode.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{selectedNode.subtitle}</p>

                  {/* Line Item Breakdown */}
                  {selectedNode.metadata && Object.keys(selectedNode.metadata).length > 0 && (
                    <div className="space-y-1.5 pt-2 text-xs">
                      {Object.entries(selectedNode.metadata).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#E4E6E0]">
                          <span className="text-slate-600 capitalize">{k.replace(/_/g, " ")}:</span>
                          <span className="font-semibold text-slate-900 tabular-nums">
                            {typeof v === "number" ? `₹${v.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : String(v)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Arithmetic Proof & Evidence Checklist */}
                <div className="p-5 rounded-xl bg-white border border-[#E4E6E0] space-y-3">
                  <div className="flex items-center space-x-2 pb-2 border-b border-[#E4E6E0]">
                    <Sparkles className="w-4 h-4 text-[#3730A3]" />
                    <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-900">
                      Verified Evidence & Proof
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {trail.evidence_checklist.map((ev, idx) => (
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

                  {/* AI Verdict */}
                  <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-slate-800 leading-relaxed">
                    <strong className="text-[#3730A3] block mb-0.5 font-bold">Controller Verdict:</strong>
                    {trail.ai_verdict}
                  </div>
                </div>

              </div>
            )}

          </div>
        ) : null}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E4E6E0]">
          <div className="text-xs text-slate-500">
            {trail && (
              <span>
                Net Settlement: <strong className="text-slate-900 font-semibold tabular-nums">₹{trail.expected_net.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong> | Bank Credit: <strong className="text-slate-900 font-semibold tabular-nums">₹{trail.actual_bank_credit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] px-6 py-2.5 text-xs font-semibold rounded-xl bg-[#3730A3] hover:bg-[#312E81] text-white transition-all cursor-pointer"
          >
            Close Trail
          </button>
        </div>

      </div>
    </div>
  );
}
