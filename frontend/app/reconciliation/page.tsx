"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { MoneyTrailModal } from "@/components/MoneyTrailModal";
import { DailyCloseModal } from "@/components/DailyCloseModal";
import { DecisionGateModal } from "@/components/DecisionGateModal";
import { Layers, Search, Filter, CheckCircle2, AlertTriangle, Clock, XCircle, ArrowRight, Eye, Scale, Calculator } from "lucide-react";
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

  const statusBadges = {
    MATCHED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    PARTIAL: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    MISMATCH: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    UNRESOLVED: "bg-slate-700/50 text-slate-300 border-slate-600",
    AUTO_RESOLVED: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30"
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar
        onReconcileTrigger={loadRecon}
        onOpenDailyClose={() => setIsDailyCloseOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
              <Layers className="w-6 h-6 text-indigo-400" />
              <span>3-Way Reconciliation Explorer</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Multi-source matching with deterministic audit gates: Razorpay Payments ⟷ Settlement Batches ⟷ Bank Statement Credits
            </p>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Settlement ID or Tx..."
                className="pl-9 pr-4 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 w-48 sm:w-64"
              />
            </div>

            <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              {["ALL", "MATCHED", "MISMATCH", "UNRESOLVED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    filterStatus === st
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reconciliation Table */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Settlement ID</th>
                  <th className="py-3.5 px-4">Bank Transaction</th>
                  <th className="py-3.5 px-4">Match Status</th>
                  <th className="py-3.5 px-4">Score</th>
                  <th className="py-3.5 px-4">Expected Net</th>
                  <th className="py-3.5 px-4">Bank Credit</th>
                  <th className="py-3.5 px-4">Variance</th>
                  <th className="py-3.5 px-4">Audit Gates</th>
                  <th className="py-3.5 px-4">Money Trail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    
                    {/* Settlement ID */}
                    <td className="py-3.5 px-4 font-mono font-medium text-white">
                      {item.settlement_id || <span className="text-slate-500 italic">None (Direct Bank Entry)</span>}
                    </td>

                    {/* Bank Tx ID */}
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {item.bank_transaction_id || <span className="text-rose-400 italic">Missing from Bank</span>}
                    </td>

                    {/* Match Status */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusBadges[item.match_status] || "bg-slate-800 text-slate-300"}`}>
                        {item.match_status}
                      </span>
                    </td>

                    {/* Score */}
                    <td className="py-3.5 px-4 font-semibold">
                      <span className={item.match_score >= 95 ? "text-emerald-400" : item.match_score >= 80 ? "text-amber-400" : "text-rose-400"}>
                        {item.match_score}%
                      </span>
                    </td>

                    {/* Expected Net */}
                    <td className="py-3.5 px-4 font-semibold text-white">
                      ₹{item.expected_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>

                    {/* Actual Bank Credit */}
                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      ₹{item.actual_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>

                    {/* Difference */}
                    <td className="py-3.5 px-4">
                      {item.difference > 0 ? (
                        <span className="font-bold text-rose-400">
                          -₹{item.difference.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-medium">₹0.00</span>
                      )}
                    </td>

                    {/* Why This Decision Gate Action */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleOpenDecisionGate(item.id)}
                        className="flex items-center space-x-1 px-2 py-1 text-[10px] font-bold rounded-lg bg-slate-950 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer"
                        title="Audit 6 deterministic gates and safety margin"
                      >
                        <Scale className="w-3 h-3" />
                        <span>Why Decision?</span>
                      </button>
                    </td>

                    {/* Money Trail Action */}
                    <td className="py-3.5 px-4">
                      {item.settlement_id ? (
                        <button
                          onClick={() => handleOpenTrail(item.settlement_id)}
                          className="flex items-center space-x-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/50 transition-all cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Money Trail</span>
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
