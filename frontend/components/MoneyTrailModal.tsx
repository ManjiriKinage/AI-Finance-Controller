"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Building2,
  CreditCard,
  Layers,
  Landmark,
  BookOpen,
  Sparkles,
  RefreshCw
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
      border: "border-emerald-500/40",
      bg: "bg-emerald-950/20",
      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      icon: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      dot: "bg-emerald-500"
    },
    MISMATCH: {
      border: "border-rose-500/40",
      bg: "bg-rose-950/20",
      badge: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      icon: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      dot: "bg-rose-500"
    },
    UNRESOLVED: {
      border: "border-amber-500/40",
      bg: "bg-amber-950/20",
      badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      icon: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      dot: "bg-amber-500"
    },
    WARNING: {
      border: "border-indigo-500/40",
      bg: "bg-indigo-950/20",
      badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
      icon: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
      dot: "bg-indigo-500"
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl rounded-3xl bg-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col justify-between">
        
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 text-white shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Interactive Money Trail</h2>
                <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-slate-800 text-indigo-300 border border-indigo-500/30 rounded-full">
                  {trail?.settlement_id || settlementId}
                </span>
                {trail?.utr && (
                  <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                    UTR: {trail.utr}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-Node Financial Graph: Customer ⟷ Payment ⟷ Settlement ⟷ Bank Statement ⟷ Accounting Ledger
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
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-sm text-slate-400">Tracing transaction graph across payment gateway and bank statement...</p>
          </div>
        ) : trail ? (
          <div className="my-6 space-y-6 overflow-y-auto pr-1">
            
            {/* Visual Node Flow Horizontal Stepper */}
            <div className="relative p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 overflow-x-auto">
              <div className="min-w-[700px] flex items-center justify-between relative">
                
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />

                {trail.nodes.map((node, idx) => {
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
                        className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all duration-200 ${style.border} ${style.bg} ${
                          isSelected ? "scale-110 shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950" : "group-hover:scale-105"
                        }`}
                      >
                        <Icon className={`w-6 h-6 ${style.icon.split(" ")[0]}`} />
                      </div>

                      {/* Title & Amount */}
                      <span className="mt-2 text-xs font-bold text-white uppercase tracking-wider">{node.step}</span>
                      <span className="text-xs font-semibold text-slate-200">
                        ₹{node.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                      <span className={`mt-1 px-2 py-0.2 text-[9px] font-bold uppercase rounded-full border ${style.badge}`}>
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
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Inspected Step: {selectedNode.step}</span>
                      <h4 className="text-base font-bold text-white">{selectedNode.title}</h4>
                    </div>
                    <span className="text-lg font-bold text-emerald-400">
                      ₹{selectedNode.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">{selectedNode.subtitle}</p>

                  {/* Line Item Breakdown */}
                  {selectedNode.metadata && Object.keys(selectedNode.metadata).length > 0 && (
                    <div className="space-y-1.5 pt-2 text-xs">
                      {Object.entries(selectedNode.metadata).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-850">
                          <span className="text-slate-400 capitalize">{k.replace(/_/g, " ")}:</span>
                          <span className="font-semibold text-slate-200">
                            {typeof v === "number" ? `₹${v.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : String(v)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Arithmetic Proof & Evidence Checklist */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/30 via-slate-900 to-slate-950 border border-indigo-700/30 space-y-3">
                  <div className="flex items-center space-x-2 pb-2 border-b border-indigo-900/60">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">Verified Evidence & Proof</h4>
                  </div>

                  <div className="space-y-2">
                    {trail.evidence_checklist.map((ev, idx) => (
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

                  {/* AI Verdict */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                    <strong className="text-white block mb-0.5">Controller Verdict:</strong>
                    {trail.ai_verdict}
                  </div>
                </div>

              </div>
            )}

          </div>
        ) : null}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            {trail && (
              <span>
                Net Settlement: <strong>₹{trail.expected_net.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong> | Bank Credit: <strong>₹{trail.actual_bank_credit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-all"
          >
            Close Trail
          </button>
        </div>

      </div>
    </div>
  );
}
