"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
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
    <div className="min-h-screen bg-[#F5F6F3] flex flex-col lg:flex-row font-sans pb-20 lg:pb-0">
      
      {/* Light Sidebar (Desktop ~1440px fluid) */}
      <Sidebar exceptionCount={exceptions.length} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full lg:max-w-[1180px] xl:max-w-[1240px]">
        
        {/* Mobile Header (< 1024px) */}
        <Navbar onReconcileTrigger={loadExceptions} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">

          {/* Institutional Header Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-heading font-bold text-xl sm:text-2xl text-slate-900 tracking-tight flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 stroke-[1.5]" />
                  <span>Exception Queue</span>
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Automated reconciliation variances flagged for review, simulation, and manual adjustment
                </p>
              </div>

              {/* Summary Badges */}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-[#F5F6F3] text-slate-700 border border-[#E5E7EB]">
                  Total: <strong className="ml-1 text-slate-900 font-bold">{exceptions.length}</strong>
                </span>
                <span className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-red-50 text-red-700 border border-red-200">
                  High Risk: <strong className="ml-1 font-bold">{exceptions.filter(e => e.severity === "HIGH").length}</strong>
                </span>
              </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E5E7EB]">
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 stroke-[1.5]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Exception ID, Settlement..."
                  className="w-full pl-9 pr-4 min-h-[44px] text-xs bg-[#F5F6F3] border border-[#E5E7EB] rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#3730A3]"
                />
              </div>

              <div className="flex items-center space-x-1.5">
                {["ALL", "HIGH", "MEDIUM"].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setFilterSeverity(sev)}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl font-medium text-xs transition-colors cursor-pointer ${
                      filterSeverity === sev
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-600 hover:text-slate-900 hover:bg-[#F5F6F3] border border-[#E5E7EB]"
                    }`}
                  >
                    {sev === "ALL" ? "All Severities" : `${sev} Exposure`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-none">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F6F3] border-b border-[#E5E7EB] text-[11px] text-slate-500 uppercase font-mono tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Exception ID</th>
                    <th className="py-3.5 px-4 font-semibold">Type & Context</th>
                    <th className="py-3.5 px-4 font-semibold">Exposure</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Variance</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Confidence</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Trace</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-xs text-slate-400 font-mono">
                        Loading exception ledger...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-xs text-slate-500">
                        No reconciliation exceptions found matching the current criteria.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((ex) => (
                      <tr key={ex.id} className="hover:bg-[#F5F6F3]/60 transition-colors">

                        {/* ID */}
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                          <div>{ex.id}</div>
                          {ex.lineage_id && (
                            <span className="text-[10px] font-mono text-slate-400 block">{ex.lineage_id}</span>
                          )}
                        </td>

                        {/* Type */}
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-slate-900 block capitalize">
                            {ex.exception_type.replace(/_/g, " ")}
                          </span>
                          <span className="text-[11px] text-slate-500 truncate max-w-xs block">
                            {ex.ai_explanation?.summary || ex.recommended_action}
                          </span>
                        </td>

                        {/* Severity */}
                        <td className="py-3.5 px-4">
                          {ex.severity === "HIGH" ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-red-50 text-red-700 border border-red-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                              High
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                              Medium
                            </span>
                          )}
                        </td>

                        {/* Variance Amount */}
                        <td className="py-3.5 px-4 font-mono font-bold text-red-600 tabular-nums text-right text-sm">
                          ₹{ex.difference.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>

                        {/* Confidence */}
                        <td className="py-3.5 px-4 font-mono tabular-nums text-center text-slate-600">
                          {ex.confidence}%
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                            ex.status === "RESOLVED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : ex.status === "UNDER_REVIEW"
                                ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}>
                            {ex.status}
                          </span>
                        </td>

                        {/* Forensic Trace */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => {
                              setInvestigateId(ex.id);
                              setIsInvestigateOpen(true);
                            }}
                            className="min-h-[36px] inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white hover:bg-[#F5F6F3] text-[#3730A3] border border-[#E5E7EB] transition-colors cursor-pointer"
                            title="Inspect 7-step SQL trace"
                          >
                            <Search className="w-3.5 h-3.5 stroke-[1.5]" />
                            <span>Trace</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center space-x-1.5">
                            <button
                              onClick={() => {
                                setWhatIfId(ex.id);
                                setIsWhatIfOpen(true);
                              }}
                              className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg border border-[#E5E7EB] transition-colors cursor-pointer"
                              title="Simulate Impact on Period Close"
                              aria-label="Simulate Impact"
                            >
                              <Zap className="w-3.5 h-3.5 stroke-[1.5]" />
                            </button>

                            <button
                              onClick={() => {
                                setReplayId(ex.id);
                                setIsReplayOpen(true);
                              }}
                              className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-[#F5F6F3] rounded-lg border border-[#E5E7EB] transition-colors cursor-pointer"
                              title="Chronological Audit History"
                              aria-label="Audit Replay"
                            >
                              <History className="w-3.5 h-3.5 stroke-[1.5]" />
                            </button>

                            <button
                              onClick={() => setSelectedException(ex)}
                              className="min-h-[36px] px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#3730A3] hover:bg-indigo-900 text-white transition-colors cursor-pointer"
                            >
                              Triage
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>

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
