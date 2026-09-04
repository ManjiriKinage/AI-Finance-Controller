"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { ExceptionDrawer } from "@/components/ExceptionDrawer";
import { WhatIfModal } from "@/components/WhatIfModal";
import { InvestigatorModal } from "@/components/InvestigatorModal";
import { AuditReplayModal } from "@/components/AuditReplayModal";
import { CalculationProofModal } from "@/components/CalculationProofModal";
import { MoneyTrailModal } from "@/components/MoneyTrailModal";
import {
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Zap,
  History,
  Eye,
  Calculator,
  ArrowUpRight
} from "lucide-react";
import { api, ExceptionItem } from "@/lib/api";

export default function ExceptionsPage() {
  const [exceptions, setExceptions] = useState<ExceptionItem[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedException, setSelectedException] = useState<ExceptionItem | null>(null);
  
  // Modals
  const [whatIfId, setWhatIfId] = useState<string | null>(null);
  const [investigateId, setInvestigateId] = useState<string | null>(null);
  const [replayId, setReplayId] = useState<string | null>(null);
  const [calcSettlementId, setCalcSettlementId] = useState<string | null>(null);
  const [trailSettlementId, setTrailSettlementId] = useState<string | null>(null);
  
  const [isWhatIfOpen, setIsWhatIfOpen] = useState(false);
  const [isInvestigateOpen, setIsInvestigateOpen] = useState(false);
  const [isReplayOpen, setIsReplayOpen] = useState(false);
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [isTrailOpen, setIsTrailOpen] = useState(false);
  
  const [loading, setLoading] = useState(true);

  const loadExceptions = async () => {
    try {
      setLoading(true);
      const data = await api.getExceptions();
      setExceptions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExceptions();
  }, []);

  const filtered = exceptions.filter((ex) => {
    const matchesSev = filterSeverity === "ALL" || ex.severity === filterSeverity;
    const matchesStat = filterStatus === "ALL" || ex.status === filterStatus;
    const matchesSearch =
      !searchQuery ||
      ex.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.exception_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ex.settlement_id && ex.settlement_id.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSev && matchesStat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Exception Queue (Prioritized by Exposure)</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Automated reconciliation variances flagged for review, simulation, and manual adjustment
            </p>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Exception ID, Settlement..."
                className="pl-8 pr-4 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-slate-700 w-48 sm:w-64"
              />
            </div>

            <div className="flex items-center space-x-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-xs">
              {["ALL", "HIGH", "MEDIUM"].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-2.5 py-1 rounded-md font-medium text-xs transition-all cursor-pointer ${
                    filterSeverity === sev
                      ? "bg-slate-800 text-white border border-slate-700/60 shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {sev === "ALL" ? "All Severities" : `${sev} Exposure`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Compact Table */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/90 border-b border-slate-800 text-[11px] text-slate-400 uppercase font-mono tracking-wider">
                <tr>
                  <th className="py-3 px-4">Exception ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Exposure Severity</th>
                  <th className="py-3 px-4 text-right">Variance Amount</th>
                  <th className="py-3 px-4 text-center">Confidence</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Forensic Trace</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filtered.map((ex) => (
                  <tr key={ex.id} className="hover:bg-slate-800/30 transition-colors">
                    
                    {/* ID */}
                    <td className="py-3 px-4 font-mono font-medium text-white">
                      <div>{ex.id}</div>
                      {ex.lineage_id && (
                        <span className="text-[10px] font-mono text-slate-500">{ex.lineage_id}</span>
                      )}
                    </td>

                    {/* Type */}
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-200 block">
                        {ex.exception_type.replace(/_/g, " ")}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate max-w-xs block">
                        {ex.ai_explanation?.summary || ex.recommended_action}
                      </span>
                    </td>

                    {/* Severity */}
                    <td className="py-3 px-4">
                      {ex.severity === "HIGH" ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                          High Exposure
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                          Medium
                        </span>
                      )}
                    </td>

                    {/* Variance Amount */}
                    <td className="py-3 px-4 font-mono font-bold text-rose-400 text-right">
                      ₹{ex.difference.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>

                    {/* Confidence */}
                    <td className="py-3 px-4 font-mono text-center text-slate-300">
                      {ex.confidence}%
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                        ex.status === "RESOLVED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : ex.status === "UNDER_REVIEW"
                          ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                          : "bg-slate-800 text-slate-300 border-slate-700/60"
                      }`}>
                        {ex.status}
                      </span>
                    </td>

                    {/* Forensic Trace */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setInvestigateId(ex.id);
                          setIsInvestigateOpen(true);
                        }}
                        className="inline-flex items-center space-x-1 px-2 py-1 text-[11px] font-medium rounded-md bg-slate-800/80 hover:bg-slate-800 text-indigo-300 border border-slate-700/50 transition-colors cursor-pointer"
                        title="Inspect 7-step SQL trace"
                      >
                        <Search className="w-3 h-3 text-indigo-400" />
                        <span>Trace</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center space-x-1">
                        <button
                          onClick={() => {
                            setWhatIfId(ex.id);
                            setIsWhatIfOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                          title="Simulate Impact on Period Close"
                        >
                          <Zap className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setReplayId(ex.id);
                            setIsReplayOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                          title="Chronological Audit History"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setSelectedException(ex)}
                          className="px-2 py-1 text-[11px] font-medium rounded-md bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-colors cursor-pointer ml-1"
                        >
                          Triage
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      <ExceptionDrawer
        exception={selectedException}
        onClose={() => setSelectedException(null)}
        onActionComplete={() => {
          setSelectedException(null);
          loadExceptions();
        }}
      />

      <WhatIfModal
        exceptionId={whatIfId}
        isOpen={isWhatIfOpen}
        onClose={() => setIsWhatIfOpen(false)}
        onApplyResolution={loadExceptions}
      />

      <InvestigatorModal
        exceptionId={investigateId}
        isOpen={isInvestigateOpen}
        onClose={() => setIsInvestigateOpen(false)}
        onResolve={loadExceptions}
      />

      <AuditReplayModal
        exceptionId={replayId}
        isOpen={isReplayOpen}
        onClose={() => setIsReplayOpen(false)}
      />

      <CalculationProofModal
        settlementId={calcSettlementId}
        isOpen={isCalcOpen}
        onClose={() => setIsCalcOpen(false)}
      />

      <MoneyTrailModal
        settlementId={trailSettlementId}
        isOpen={isTrailOpen}
        onClose={() => setIsTrailOpen(false)}
      />

    </div>
  );
}
