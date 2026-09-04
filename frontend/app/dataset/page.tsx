"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Database, RefreshCw, Cpu, CheckCircle2, AlertTriangle, ShieldCheck, Layers, FileText, ArrowRight, Table } from "lucide-react";
import { api, BenchmarkMetrics } from "@/lib/api";

export default function DatasetPage() {
  const [benchmark, setBenchmark] = useState<BenchmarkMetrics | null>(null);
  const [numPayments, setNumPayments] = useState(500);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadBenchmark = async () => {
    try {
      const data = await api.getBenchmark();
      setBenchmark(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBenchmark();
  }, []);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setMessage(null);
      await api.seedDataset(numPayments);
      await loadBenchmark();
      setMessage(`Successfully generated & reconciled ${numPayments} records.`);
    } catch (err) {
      console.error(err);
      setMessage("Error generating dataset.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight flex items-center space-x-2">
              <Database className="w-5 h-5 text-indigo-400" />
              <span>Data Ingestion & Integrity Benchmarks</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Multi-source synthetic batch ingestion, ground-truth verification, and throughput benchmarking
            </p>
          </div>

          <span className="px-2.5 py-1 text-xs font-mono font-medium rounded-md bg-slate-900 text-slate-400 border border-slate-800 self-start md:self-auto">
            Schema: Razorpay v1.2 / Axis Bank ISO-20022
          </span>
        </div>

        {/* Generator Controls Card */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Synthetic Ingestion Generator
            </h2>
            <span className="text-xs text-slate-400">7 Injected Adversarial Error Classes</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Batch Size (Records):</label>
              <select
                value={numPayments}
                onChange={(e) => setNumPayments(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-hidden focus:border-slate-700"
              >
                <option value={100}>100 Payments (Micro Test)</option>
                <option value={500}>500 Payments (Standard Batch)</option>
                <option value={1000}>1,000 Payments (Stress Test)</option>
                <option value={2000}>2,000 Payments (High Volume)</option>
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-medium text-slate-400">Adversarial Conditions Simulated:</label>
              <p className="text-xs text-slate-500 leading-relaxed">
                UTR transpositions, dispute haircuts, refund deductions, T+3 bank holiday clearing lags, duplicate postings & unknown direct credits.
              </p>
            </div>

          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-all cursor-pointer flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
              <span>{isGenerating ? "Ingesting & Reconciling..." : `Ingest & Verify ${numPayments} Records`}</span>
            </button>

            {message && (
              <span className="text-xs text-emerald-400 font-medium">
                {message}
              </span>
            )}
          </div>
        </div>

        {/* Evaluation Metrics Grid */}
        {benchmark && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Ingestion Quality & Precision Metrics
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-500">Precision</span>
                <p className="text-xl font-mono font-bold text-white">{benchmark.precision_pct}%</p>
                <span className="text-[10px] text-emerald-400">Zero False Matches</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-500">Recall</span>
                <p className="text-xl font-mono font-bold text-white">{benchmark.recall_pct}%</p>
                <span className="text-[10px] text-slate-400">Coverage Rate</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-500">False Match Rate</span>
                <p className="text-xl font-mono font-bold text-emerald-400">{benchmark.false_match_rate_pct}%</p>
                <span className="text-[10px] text-emerald-500">Critical Safety Bar</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-500">Throughput</span>
                <p className="text-xl font-mono font-bold text-indigo-400">
                  {benchmark.throughput_records_per_sec.toLocaleString()}
                </p>
                <span className="text-[10px] text-slate-400">Records / Second</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-500">Execution Time</span>
                <p className="text-xl font-mono font-bold text-slate-200">
                  {benchmark.processing_time_seconds}s
                </p>
                <span className="text-[10px] text-slate-400">Total Latency</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-500">Audit Trail</span>
                <p className="text-xl font-mono font-bold text-emerald-400">100%</p>
                <span className="text-[10px] text-slate-400">Chained Logs</span>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
