"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { MoneyTrailModal } from "@/components/MoneyTrailModal";
import { DailyCloseModal } from "@/components/DailyCloseModal";
import { DecisionGateModal } from "@/components/DecisionGateModal";
import { Layers, Search, Filter, CheckCircle2, AlertTriangle, Clock, XCircle, ArrowRight, Eye, Scale, Calculator, ArrowUpRight } from "lucide-react";
import { api, ReconciliationItem, DailyCloseResponse } from "@/lib/api";

export default function ReconciliationPage() {
  const [records, setRecords] = useState<ReconciliationItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrailId, setSelectedTrailId] = useState<string | null>(null);
  const [selectedGateResultId, setSelectedGateResultId] = useState<number | null>(null);
  const [isTrailOpen, setIsTrailOpen] = useState(false);
  const [isGateOpen, setIsGateOpen] = useState(false);
  const [isDailyCloseOpen, setIsDailyCloseOpen] = useState(false);
  const [dailyClose, setDailyClose] = useState<DailyCloseResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRecon = async () => {
    try {
      setLoading(true);
      const [data, closeData] = await Promise.all([
        api.getReconciliations(),
        api.getDailyClose()
      ]);
      setRecords(data);
      setDailyClose(closeData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecon();
  }, []);

  const handleOpenTrail = (settlementId?: string) => {
    if (settlementId) {
      setSelectedTrailId(settlementId);
      setIsTrailOpen(true);
    }
  };

  const handleOpenDecisionGate = (resId: number) => {
    setSelectedGateResultId(resId);
    setIsGateOpen(true);
  };

  const filtered = records.filter((r) => {
    const matchesStatus = filterStatus === "ALL" || r.match_status === filterStatus;
    const matchesSearch =
      !searchQuery ||
      (r.settlement_id && r.settlement_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.bank_transaction_id && r.bank_transaction_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.matching_method && r.matching_method.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <Navbar
        onReconcileTrigger={loadRecon}
        onOpenDailyClose={() => setIsDailyCloseOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight flex items-center space-x-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>Reconciliation Ledger</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Multi-source 3-way matching: Payment Gateway Inflows ⟷ Settlement Batches ⟷ Bank Statement Credits
            </p>
          </div>

          {/* Search & Status Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by UTR, ID, or Reference..."
                className="pl-8 pr-4 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-slate-700 w-48 sm:w-64"
              />
            </div>

            <div className="flex items-center space-x-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-xs">
              {["ALL", "MATCHED", "MISMATCH", "UNRESOLVED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded-md font-medium text-xs transition-all cursor-pointer ${
                    filterStatus === st
                      ? "bg-slate-800 text-white border border-slate-700/60 shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {st === "ALL" ? "All Entries" : st === "MATCHED" ? "Matched" : st === "MISMATCH" ? "Mismatches" : "Unresolved"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Compact Institutional Table */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/90 border-b border-slate-800 text-[11px] text-slate-400 uppercase font-mono tracking-wider">
                <tr>
                  <th className="py-3 px-4">Settlement Batch</th>
                  <th className="py-3 px-4">Bank Reference</th>
                  <th className="py-3 px-4">Match Status</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4 text-right">Expected Net</th>
                  <th className="py-3 px-4 text-right">Bank Credit</th>
                  <th className="py-3 px-4 text-right">Variance</th>
                  <th className="py-3 px-4 text-center">Match Logic</th>
                  <th className="py-3 px-4 text-center">Audit Trail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    
                    {/* Settlement ID */}
                    <td className="py-3 px-4 font-mono font-medium text-white">
                      {item.settlement_id || <span className="text-slate-500 italic">Direct Bank Inflow</span>}
                    </td>

                    {/* Bank Tx ID */}
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {item.bank_transaction_id || <span className="text-rose-400 italic">Uncredited</span>}
                    </td>

                    {/* Subtle Minimalist Status Indicator */}
                    <td className="py-3 px-4">
                      {item.match_status === "MATCHED" ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          Matched
                        </span>
                      ) : item.match_status === "MISMATCH" ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                          Mismatch
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700/60">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          Unresolved
                        </span>
                      )}
                    </td>

                    {/* Score */}
                    <td className="py-3 px-4 font-mono font-medium">
                      <span className={item.match_score >= 95 ? "text-emerald-400" : item.match_score >= 80 ? "text-amber-400" : "text-rose-400"}>
                        {item.match_score}%
                      </span>
                    </td>

                    {/* Expected Net */}
                    <td className="py-3 px-4 font-mono font-semibold text-white text-right">
                      ₹{item.expected_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>

                    {/* Actual Bank Credit */}
                    <td className="py-3 px-4 font-mono font-semibold text-slate-200 text-right">
                      ₹{item.actual_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>

                    {/* Variance */}
                    <td className="py-3 px-4 text-right">
                      {item.difference > 0 ? (
                        <span className="font-mono font-bold text-rose-400">
                          -₹{item.difference.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="font-mono text-emerald-400">₹0.00</span>
                      )}
                    </td>

                    {/* Match Logic */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenDecisionGate(item.id)}
                        className="inline-flex items-center space-x-1 px-2 py-1 text-[11px] font-medium rounded-md bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/50 transition-colors cursor-pointer"
                        title="Audit Deterministic Gates"
                      >
                        <Scale className="w-3 h-3 text-slate-400" />
                        <span>Logic</span>
                      </button>
                    </td>

                    {/* Audit Trail */}
                    <td className="py-3 px-4 text-center">
                      {item.settlement_id ? (
                        <button
                          onClick={() => handleOpenTrail(item.settlement_id)}
                          className="inline-flex items-center space-x-1 px-2 py-1 text-[11px] font-medium rounded-md bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-700/40 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Trace</span>
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[11px] font-mono">{item.matching_method}</span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      <DecisionGateModal
        resultId={selectedGateResultId}
        isOpen={isGateOpen}
        onClose={() => setIsGateOpen(false)}
      />

      <MoneyTrailModal
        settlementId={selectedTrailId}
        isOpen={isTrailOpen}
        onClose={() => setIsTrailOpen(false)}
      />

      <DailyCloseModal
        isOpen={isDailyCloseOpen}
        onClose={() => setIsDailyCloseOpen(false)}
        dailyCloseData={dailyClose}
        onRefresh={loadRecon}
      />

    </div>
  );
}
