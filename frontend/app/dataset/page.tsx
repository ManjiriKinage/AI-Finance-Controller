"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Database, RefreshCw, Cpu, CheckCircle2, ShieldAlert, FileText, Zap, Download } from "lucide-react";
import { api, BenchmarkMetrics } from "@/lib/api";

export default function DatasetPage() {
  const [recordCount, setRecordCount] = useState<number>(500);
  const [loading, setLoading] = useState<boolean>(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [benchmark, setBenchmark] = useState<BenchmarkMetrics | null>(null);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setResultMessage(null);
      await api.seedDataset(recordCount);
      const bRes = await api.getBenchmark();
      setBenchmark(bRes);
      setResultMessage(`Successfully seeded ${recordCount} payments, grouped into settlements & bank statements with 7 realistic fintech error classes.`);
    } catch (err) {
      console.error(err);
      setResultMessage("Error generating dataset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
              <Database className="w-6 h-6 text-emerald-400" />
              <span>Synthetic Datasets & Objective Evaluation</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Generate 500+ realistic multi-anomaly batches paired with ground-truth verification CSVs
            </p>
          </div>
        </div>

        {/* Generator Card */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Generate Benchmark Batch</h3>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              Target: 50+ to 1,000+ Records
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Select Payment Batch Size:</span>
              <span className="font-bold text-emerald-400 text-sm">{recordCount} payments</span>
            </div>

            <input
              type="range"
              min={100}
              max={1500}
              step={100}
              value={recordCount}
              onChange={(e) => setRecordCount(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>100 records</span>
              <span>500 records (Standard)</span>
              <span>1,500 records</span>
            </div>
          </div>

          {/* Anomaly Distribution Grid */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Injected Real-World Error Classes:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="font-bold text-emerald-400">80%</span> Clean Matches
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="font-bold text-amber-400">5%</span> Amount Mismatches
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="font-bold text-rose-400">4%</span> Missing Bank Entries
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="font-bold text-indigo-400">3%</span> Duplicate Postings
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="font-bold text-slate-300">3%</span> Timing Differences
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="font-bold text-amber-400">2%</span> Refund Mismatches
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="font-bold text-rose-400">2%</span> Unknown Bank Entries
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="font-bold text-indigo-400">1%</span> Fee / Tax Rounding
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center space-x-2 px-5 py-3 text-xs sm:text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Generating & Reconciling..." : `Generate & Reconcile ${recordCount} Records`}</span>
            </button>
          </div>

          {resultMessage && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-700/40 text-xs text-emerald-300 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{resultMessage}</span>
            </div>
          )}
        </div>

        {/* Benchmark Results */}
        {benchmark && (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/30 to-slate-900 border border-indigo-700/40 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-300 flex items-center space-x-2">
                <Cpu className="w-4 h-4" />
                <span>Benchmark Execution Results</span>
              </h3>
              <span className="text-xs text-slate-400">Measured Runtime: {benchmark.processing_time_seconds}s</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <p className="text-[11px] text-slate-400 uppercase">Throughput</p>
                <p className="text-xl font-bold text-emerald-400 mt-1">{benchmark.throughput_records_per_sec.toLocaleString()} rec/s</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <p className="text-[11px] text-slate-400 uppercase">Precision</p>
                <p className="text-xl font-bold text-indigo-400 mt-1">{benchmark.precision_pct}%</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <p className="text-[11px] text-slate-400 uppercase">Recall</p>
                <p className="text-xl font-bold text-indigo-400 mt-1">{benchmark.recall_pct}%</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <p className="text-[11px] text-slate-400 uppercase">False Match Rate</p>
                <p className="text-xl font-bold text-emerald-400 mt-1">{benchmark.false_match_rate_pct}%</p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
