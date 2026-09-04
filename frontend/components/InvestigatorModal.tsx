"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Cpu,
  Layers,
  Code,
  Database,
  ChevronDown,
  ChevronUp
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
    SUCCESS: <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />,
    DISCREPANCY: <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />,
    WARNING: <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />,
    INFO: <HelpCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Auditable SQL Forensic Investigator</h2>
                <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-slate-800 text-indigo-300 border border-indigo-500/30 rounded-full">
                  {exceptionId}
                </span>
                {data?.lineage_id && (
                  <span className="px-2 py-0.5 text-xs font-mono text-slate-400 bg-slate-950 rounded-md border border-slate-800">
                    {data.lineage_id}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Every deduction proven via verified relational SQL queries against SQLite database tables
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-sm text-slate-400">Executing 7-step SQL forensic queries across ledger tables...</p>
          </div>
        ) : data ? (
          <div className="my-6 space-y-4 overflow-y-auto pr-1">
            
            {/* Investigation Sequence */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Forensic SQL Execution Sequence ({revealedSteps}/{data.investigation_steps.length} Steps)
              </span>

              {data.investigation_steps.slice(0, revealedSteps).map((step) => (
                <div
                  key={step.step_number}
                  className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-2.5 transition-all animate-fade-in hover:border-indigo-500/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2.5">
                      <div className="mt-0.5">{stepStatusIcons[step.status]}</div>
                      <div>
                        <span className="text-xs font-bold text-white">
                          Step {step.step_number}: {step.name}
                        </span>
                        <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{step.findings}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-500 font-mono">{step.timestamp}</span>
                      {step.sql_audit && (
                        <button
                          onClick={() => toggleSql(step.step_number)}
                          className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-slate-700 flex items-center space-x-1 cursor-pointer"
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
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 font-mono text-[11px] animate-fade-in">
                      <div className="flex items-center justify-between text-slate-400 text-[10px]">
                        <span>Target Table: <strong className="text-white">{step.sql_audit.table_name}</strong></span>
                        <span>Matched Rows: <strong className="text-emerald-400">{step.sql_audit.matched_rows_count}</strong></span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 text-indigo-300 border border-slate-850 overflow-x-auto">
                        <code>{step.sql_audit.query_string}</code>
                      </div>
                      {step.sql_audit.raw_rows.length > 0 && (
                        <div className="p-2 rounded-lg bg-slate-950/70 text-slate-300 border border-slate-850 overflow-x-auto text-[10px]">
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
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Variance Attribution Matrix</h4>
                  <div className="space-y-1.5 text-xs">
                    {Object.entries(data.variance_attribution).map(([factor, amt]) => (
                      <div key={factor} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-850">
                        <span className="text-slate-300 capitalize">{factor.replace(/_/g, " ")}</span>
                        <span className="font-bold text-rose-400">₹{amt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Final Determination Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-700/40 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">Actionable Verdict</h4>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">{data.verdict}</p>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 mt-2">
                    <strong className="text-indigo-400 block mb-0.5">Recommended Action:</strong>
                    {data.recommended_action}
                  </div>
                </div>

              </div>
            )}

          </div>
        ) : null}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>AI inferences cross-checked against relational database evidence</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-all cursor-pointer"
          >
            Close Investigation
          </button>
        </div>

      </div>
    </div>
  );
}
