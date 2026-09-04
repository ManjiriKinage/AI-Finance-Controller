"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { ExceptionDrawer } from "@/components/ExceptionDrawer";
import { AlertTriangle, Filter, CheckCircle2, XCircle, ArrowUpRight, Search, ShieldAlert, Check } from "lucide-react";
import { api, ExceptionItem } from "@/lib/api";

export default function ExceptionsPage() {
  const [exceptions, setExceptions] = useState<ExceptionItem[]>([]);
  const [selectedException, setSelectedException] = useState<ExceptionItem | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
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

  const handleActionComplete = (updated: ExceptionItem) => {
    setSelectedException(null);
    loadExceptions();
  };

  const filtered = exceptions.filter((ex) => {
    const matchesSev = severityFilter === "ALL" || ex.severity === severityFilter;
    const matchesStat = statusFilter === "ALL" || ex.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      ex.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ex.settlement_id && ex.settlement_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ex.exception_type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSev && matchesStat && matchesSearch;
  });

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

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar onReconcileTrigger={loadExceptions} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <span>Exception Management Center</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Priority-ranked exceptions with evidence checklists and 1-click human-in-the-loop triage
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Exception ID, Settlement..."
                className="pl-9 pr-4 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 w-52 sm:w-64"
              />
            </div>

            {/* Severity Filter */}
            <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              {["ALL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    severityFilter === sev
                      ? "bg-slate-800 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              {["ALL", "OPEN", "RESOLVED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    statusFilter === st
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

        {/* Exceptions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ex) => (
            <div
              key={ex.id}
              onClick={() => setSelectedException(ex)}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 cursor-pointer transition-all flex flex-col justify-between space-y-4 group shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-white font-mono">{ex.id}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${severityBadges[ex.severity]}`}>
                      {ex.severity}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${statusBadges[ex.status]}`}>
                    {ex.status}
                  </span>
                </div>

                <p className="mt-2 text-xs font-semibold text-slate-200">
                  {ex.exception_type.replace(/_/g, " ")}
                </p>

                <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                  {ex.ai_explanation?.summary || ex.recommended_action}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Variance</span>
                  <span className="text-base font-bold text-rose-400">
                    ₹{ex.difference.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Confidence</span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    {ex.confidence}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-indigo-400 group-hover:underline pt-1">
                <span>Inspect Evidence Checklist</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>

            </div>
          ))}
        </div>

      </main>

      {/* Exception Detail & Triage Drawer */}
      <ExceptionDrawer
        exception={selectedException}
        onClose={() => setSelectedException(null)}
        onActionComplete={handleActionComplete}
      />

    </div>
  );
}
