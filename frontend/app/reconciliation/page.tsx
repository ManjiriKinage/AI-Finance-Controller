"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { MoneyTrailModal } from "@/components/MoneyTrailModal";
import { DailyCloseModal } from "@/components/DailyCloseModal";
import { DecisionGateModal } from "@/components/DecisionGateModal";
import {
  Layers,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  ArrowRight,
  Eye,
  Scale,
  Calculator,
  ArrowUpRight
} from "lucide-react";
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
    <div className="min-h-screen bg-[#F5F6F3] flex flex-col lg:flex-row font-sans pb-20 lg:pb-0">
      
      {/* Light Sidebar (Desktop ~1440px fluid) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full lg:max-w-[1180px] xl:max-w-[1240px]">
        
        {/* Mobile Header (< 1024px) */}
        <Navbar
          onReconcileTrigger={loadRecon}
          onOpenDailyClose={() => setIsDailyCloseOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">

          {/* Institutional Header Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-heading font-bold text-xl sm:text-2xl text-slate-900 tracking-tight flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-[#3730A3] stroke-[1.5]" />
                  <span>Reconciliation Ledger</span>
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Multi-source 3-way matching: Payment Gateway Inflows ⟷ Settlement Batches ⟷ Bank Statement Credits
                </p>
              </div>

              {/* Status Chips */}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-[#F5F6F3] text-slate-700 border border-[#E5E7EB]">
                  Total Records: <strong className="ml-1 text-slate-900 font-bold">{records.length}</strong>
                </span>
                <span className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Matched: <strong className="ml-1 font-bold">{records.filter(r => r.match_status === "MATCHED").length}</strong>
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
                  placeholder="Filter by UTR, Settlement ID, or Method..."
                  className="w-full pl-9 pr-4 min-h-[44px] text-xs bg-[#F5F6F3] border border-[#E5E7EB] rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#3730A3]"
                />
              </div>

              <div className="flex items-center space-x-1.5">
                {["ALL", "MATCHED", "MISMATCH", "UNRESOLVED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl font-medium text-xs transition-colors cursor-pointer ${
                      filterStatus === st
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-600 hover:text-slate-900 hover:bg-[#F5F6F3] border border-[#E5E7EB]"
                    }`}
                  >
                    {st === "ALL" ? "All Entries" : st === "MATCHED" ? "Matched" : st === "MISMATCH" ? "Mismatches" : "Unresolved"}
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
                    <th className="py-3.5 px-4 font-semibold">Settlement Batch</th>
                    <th className="py-3.5 px-4 font-semibold">Bank Reference</th>
                    <th className="py-3.5 px-4 font-semibold">Match Status</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Score</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Expected Net</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Bank Credit</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Variance</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Match Logic</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Audit Trail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-xs text-slate-400 font-mono">
                        Loading reconciliation ledger...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-xs text-slate-500">
                        No transactions found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item) => (
                      <tr key={item.id} className="hover:bg-[#F5F6F3]/60 transition-colors">

                        {/* Settlement ID */}
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                          {item.settlement_id || <span className="text-slate-400 italic">Direct Bank Inflow</span>}
                        </td>

                        {/* Bank Tx ID */}
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {item.bank_transaction_id || <span className="text-red-600 italic">Uncredited</span>}
                        </td>

                        {/* Match Status */}
                        <td className="py-3.5 px-4">
                          {item.match_status === "MATCHED" ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                              Matched
                            </span>
                          ) : item.match_status === "MISMATCH" ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-red-50 text-red-700 border border-red-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                              Mismatch
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                              Unresolved
                            </span>
                          )}
                        </td>

                        {/* Score */}
                        <td className="py-3.5 px-4 font-mono text-center font-medium">
                          <span className={item.match_score >= 95 ? "text-emerald-700" : item.match_score >= 80 ? "text-amber-700" : "text-red-700"}>
                            {item.match_score}%
                          </span>
                        </td>

                        {/* Expected Net */}
                        <td className="py-3.5 px-4 font-mono font-medium tabular-nums text-slate-900 text-right">
                          ₹{item.expected_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>

                        {/* Actual Bank Credit */}
                        <td className="py-3.5 px-4 font-mono font-medium tabular-nums text-slate-800 text-right">
                          ₹{item.actual_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>

                        {/* Variance */}
                        <td className="py-3.5 px-4 text-right">
                          {item.difference > 0 ? (
                            <span className="font-mono font-bold tabular-nums text-red-600">
                              -₹{item.difference.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </span>
                          ) : (
                            <span className="font-mono tabular-nums text-emerald-700">₹0.00</span>
                          )}
                        </td>

                        {/* Match Logic */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleOpenDecisionGate(item.id)}
                            className="min-h-[36px] inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white hover:bg-[#F5F6F3] text-slate-700 border border-[#E5E7EB] transition-colors cursor-pointer"
                            title="Audit Deterministic Gates"
                          >
                            <Scale className="w-3.5 h-3.5 stroke-[1.5] text-slate-500" />
                            <span>Logic</span>
                          </button>
                        </td>

                        {/* Audit Trail */}
                        <td className="py-3.5 px-4 text-center">
                          {item.settlement_id ? (
                            <button
                              onClick={() => handleOpenTrail(item.settlement_id)}
                              className="min-h-[36px] inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white hover:bg-[#F5F6F3] text-[#3730A3] border border-[#E5E7EB] transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 stroke-[1.5]" />
                              <span>Trace</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px] font-mono">{item.matching_method}</span>
                          )}
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
