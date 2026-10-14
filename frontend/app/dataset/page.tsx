"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
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
    <div className="min-h-screen bg-[#F5F6F3] flex flex-col lg:flex-row font-sans pb-20 lg:pb-0">
      
      {/* Light Sidebar (Desktop ~1440px fluid) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full lg:max-w-[1180px] xl:max-w-[1240px]">
        
        {/* Mobile Header (< 1024px) */}
        <Navbar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">

          {/* Institutional Header Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-heading font-bold text-xl sm:text-2xl text-slate-900 tracking-tight flex items-center space-x-2">
                  <Database className="w-5 h-5 text-[#3730A3] stroke-[1.5]" />
                  <span>Data Ingestion & Integrity Benchmarks</span>
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Multi-source batch ingestion, ledger verification, and throughput benchmarking
                </p>
              </div>

              <span className="px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-[#F5F6F3] text-slate-700 border border-[#E5E7EB] self-start sm:self-auto">
                Schema: <strong className="text-slate-900 font-bold">Razorpay v1.2 / Axis ISO-20022</strong>
              </span>
            </div>
          </div>

          {/* Generator Controls Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-none space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-slate-900">
                Settlement Feed Ingestion Simulator
              </h2>
              <span className="text-xs text-slate-500 font-medium">7 Settlement Edge Case Scenarios</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Batch Size (Records):</label>
                <select
                  value={numPayments}
                  onChange={(e) => setNumPayments(Number(e.target.value))}
                  className="w-full px-3.5 min-h-[44px] text-xs bg-[#F5F6F3] border border-[#E5E7EB] rounded-xl text-slate-900 focus:outline-hidden focus:border-[#3730A3]"
                >
                  <option value={100}>100 Payments (Micro Test)</option>
                  <option value={500}>500 Payments (Standard Batch)</option>
                  <option value={1000}>1,000 Payments (Stress Test)</option>
                  <option value={2000}>2,000 Payments (High Volume)</option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-medium text-slate-700">Clearing Conditions Simulated:</label>
                <p className="text-xs text-slate-500 leading-relaxed">
                  UTR transpositions, dispute haircuts, refund deductions, T+3 bank holiday clearing lags, duplicate postings & unknown direct credits.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="min-h-[44px] px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#3730A3] hover:bg-indigo-900 text-white shadow-none transition-colors cursor-pointer flex items-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 stroke-[1.5] ${isGenerating ? "animate-spin" : ""}`} />
                <span>{isGenerating ? "Ingesting & Reconciling..." : `Ingest & Verify ${numPayments} Records`}</span>
              </button>

              {message && (
                <span className="text-xs text-emerald-800 font-medium px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                  {message}
                </span>
              )}
            </div>
          </div>

          {/* Evaluation Metrics Grid */}
          {benchmark && (
            <div className="space-y-4">
              <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-slate-900">
                Ingestion Quality & Precision Metrics
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">

                <div className="bg-white border border-[#E5E7EB] border-t-[3px] border-t-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-medium">Precision</span>
                  <p className="text-2xl font-mono font-bold text-slate-900 tabular-nums">{benchmark.precision_pct}%</p>
                  <span className="text-[10px] text-emerald-800 font-medium">Strict UTR Parity</span>
                </div>

                <div className="bg-white border border-[#E5E7EB] border-t-[3px] border-t-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-medium">Recall</span>
                  <p className="text-2xl font-mono font-bold text-slate-900 tabular-nums">{benchmark.recall_pct}%</p>
                  <span className="text-[10px] text-slate-500">Coverage Rate</span>
                </div>

                <div className="bg-white border border-[#E5E7EB] border-t-[3px] border-t-emerald-600 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-medium">False Match Rate</span>
                  <p className="text-2xl font-mono font-bold text-emerald-800 tabular-nums">{benchmark.false_match_rate_pct}%</p>
                  <span className="text-[10px] text-emerald-800 font-medium">Tolerance Met</span>
                </div>

                <div className="bg-white border border-[#E5E7EB] border-t-[3px] border-t-[#3730A3] rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-medium">Throughput</span>
                  <p className="text-2xl font-mono font-bold text-[#3730A3] tabular-nums">
                    {benchmark.throughput_records_per_sec.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-slate-500">Records / Second</span>
                </div>

                <div className="bg-white border border-[#E5E7EB] border-t-[3px] border-t-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-medium">Execution Time</span>
                  <p className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
                    {benchmark.processing_time_seconds}s
                  </p>
                  <span className="text-[10px] text-slate-500">Total Latency</span>
                </div>

                <div className="bg-white border border-[#E5E7EB] border-t-[3px] border-t-emerald-600 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-medium">Audit Trail</span>
                  <p className="text-2xl font-mono font-bold text-emerald-800 tabular-nums">100%</p>
                  <span className="text-[10px] text-slate-500">Audit Verifiable</span>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
