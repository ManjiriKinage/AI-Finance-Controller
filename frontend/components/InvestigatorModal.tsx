"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Search,
  Database,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { api, InvestigationTraceResponse, InvestigationStep } from "@/lib/api";

interface InvestigatorModalProps {
  exceptionId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onResolve?: () => void;
}

export function InvestigatorModal({ exceptionId, isOpen, onClose, onResolve }: InvestigatorModalProps) {
  const [data, setData] = useState<InvestigationTraceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [revealedSteps, setRevealedSteps] = useState<number>(0);
  const [expandedSql, setExpandedSql] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (isOpen && exceptionId) {
      setLoading(true);
      setRevealedSteps(0);
      setExpandedSql({});
      api.getInvestigationTrace(exceptionId)
        .then((res) => {
          setData(res);
          let step = 0;
          const interval = setInterval(() => {
            step += 1;
            setRevealedSteps(step);
            if (step >= res.investigation_steps.length) {
              clearInterval(interval);
            }
          }, 200);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen, exceptionId]);

  if (!isOpen) return null;

  const toggleSql = (stepNum: number) => {
    setExpandedSql((prev) => ({ ...prev, [stepNum]: !prev[stepNum] }));
  };

  const stepStatusIcons = {
    SUCCESS: <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />,
    DISCREPANCY: <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />,
    WARNING: <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />,
    INFO: <HelpCircle className="w-4 h-4 text-[#3730A3] flex-shrink-0" />
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white border border-[#E4E6E0] p-6 sm:p-8 shadow-none overflow-hidden max-h-[92vh] flex flex-col justify-between space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E4E6E0]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-[#3730A3] border border-indigo-100">
              <Search className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
                  Auditable SQL Forensic Investigator
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-mono font-medium bg-[#F5F6F3] text-slate-700 border border-[#E4E6E0] rounded-lg">
                  {exceptionId}
                </span>
                {data?.lineage_id && (
                  <span className="px-2 py-0.5 text-xs font-mono text-slate-500 bg-[#F5F6F3] rounded-md border border-[#E4E6E0]">
                    {data.lineage_id}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Every deduction proven via verified relational SQL queries against SQLite database tables
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
            <p className="text-sm text-slate-500">Executing 7-step SQL forensic queries across ledger tables...</p>
          </div>
        ) : data ? (
          <div className="my-2 space-y-4 overflow-y-auto pr-1">

            {/* Investigation Sequence */}
            <div className="space-y-3">
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-slate-600 block mb-1">
                Forensic SQL Execution Sequence ({revealedSteps}/{data.investigation_steps.length} Steps)
              </span>

              {data.investigation_steps.slice(0, revealedSteps).map((step: InvestigationStep) => (
                <div
                  key={step.step_number}
                  className="p-3.5 rounded-xl bg-[#F5F6F3] border border-[#E4E6E0] space-y-2.5 transition-all animate-fade-in"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2.5">
                      <div className="mt-0.5">{stepStatusIcons[step.status as keyof typeof stepStatusIcons] || stepStatusIcons.INFO}</div>
                      <div>
                        <span className="text-xs font-heading font-bold text-slate-900">
                          Step {step.step_number}: {step.name}
                        </span>
                        <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">{step.findings}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-500 font-mono">{step.timestamp}</span>
                      {step.sql_audit && (
                        <button
                          onClick={() => toggleSql(step.step_number)}
                          className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-white hover:bg-[#F1F2EE] text-[#3730A3] border border-[#E4E6E0] flex items-center space-x-1 cursor-pointer transition-colors"
                        >
                          <Database className="w-3 h-3" />
                          <span>SQL Audit</span>
                          {expandedSql[step.step_number] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expandable SQL Query & Raw Rows Accordion */}
                  {step.sql_audit && expandedSql[step.step_number] && (
                    <div className="p-3 rounded-xl bg-white border border-[#E4E6E0] space-y-2 font-mono text-[11px] animate-fade-in">
                      <div className="flex items-center justify-between text-slate-600 text-[10px]">
                        <span>Target Table: <strong className="text-slate-900">{step.sql_audit.table_name}</strong></span>
                        <span>Matched Rows: <strong className="text-emerald-700">{step.sql_audit.matched_rows_count}</strong></span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#F5F6F3] text-slate-800 border border-[#E4E6E0] overflow-x-auto">
                        <code>{step.sql_audit.query_string}</code>
                      </div>
                      {step.sql_audit.raw_rows && step.sql_audit.raw_rows.length > 0 && (
                        <div className="p-2 rounded-lg bg-[#F5F6F3] text-slate-700 border border-[#E4E6E0] overflow-x-auto text-[10px]">
                          <span className="text-slate-500 block mb-1">Returned Row Preview:</span>
                          <pre>{JSON.stringify(step.sql_audit.raw_rows, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              ))}
            </div>

            {/* Variance Attribution & Verdict */}
            {revealedSteps >= data.investigation_steps.length && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in pt-2">

                {/* Variance Attribution Card */}
                <div className="p-4 rounded-xl bg-[#F5F6F3] border border-[#E4E6E0] space-y-2.5">
                  <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-700">Variance Attribution Matrix</h4>
                  <div className="space-y-1.5 text-xs">
                    {Object.entries(data.variance_attribution).map(([factor, amt]) => (
                      <div key={factor} className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#E4E6E0]">
                        <span className="text-slate-700 capitalize">{factor.replace(/_/g, " ")}</span>
                        <span className="font-bold text-rose-700 tabular-nums font-heading">
                          ₹{Number(amt).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Final Determination Card */}
                <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-[#3730A3]" />
                    <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-[#3730A3]">Actionable Verdict</h4>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed">{data.verdict}</p>
                  <div className="p-2.5 rounded-xl bg-white border border-indigo-100 text-[11px] text-slate-800 mt-2">
                    <strong className="text-[#3730A3] block mb-0.5">Recommended Action:</strong>
                    {data.recommended_action}
                  </div>
                </div>

              </div>
            )}

          </div>
        ) : null}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E4E6E0]">
          <div className="text-xs text-slate-500 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>AI inferences cross-checked against relational database evidence</span>
          </div>
          <button
            onClick={() => {
              if (onResolve) onResolve();
              onClose();
            }}
            className="min-h-[44px] px-6 py-2.5 text-xs font-semibold rounded-xl bg-[#3730A3] hover:bg-[#312E81] text-white transition-all cursor-pointer"
          >
            Close Investigation
          </button>
        </div>

      </div>
    </div>
  );
}
