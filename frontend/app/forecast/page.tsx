"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import {
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  HelpCircle,
  Clock,
  Flame,
  Info
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { api, CashForecast } from "@/lib/api";

export default function ForecastPage() {
  const [forecast, setForecast] = useState<CashForecast | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<string>("base");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getForecast()
      .then(setForecast)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activeScenario = forecast?.scenarios?.[selectedScenario];
  const chartData = activeScenario?.daily_curve || forecast?.daily_forecasts || [];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <span>Cash Intelligence & Treasury Forecast</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Multi-scenario 30-day runway projection based on verified bank liquidity, pending gateway settlements, and refund reserves
            </p>
          </div>

          {/* Scenario Selector */}
          <div className="flex items-center space-x-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-xs">
            {[
              { id: "base", label: "Base Case" },
              { id: "optimistic", label: "Optimistic (+28%)" },
              { id: "conservative", label: "Conservative (-18%)" }
            ].map((sc) => (
              <button
                key={sc.id}
                onClick={() => setSelectedScenario(sc.id)}
                className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                  selectedScenario === sc.id
                    ? "bg-slate-800 text-white border border-slate-700/60 shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {sc.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Summary Cards */}
        {forecast && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="text-[11px] font-mono uppercase text-slate-400">Liquid Cash in Bank</span>
              <p className="text-xl font-mono font-bold text-white">
                ₹{forecast.current_cash.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-slate-500">Verified Axis Bank Balance</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="text-[11px] font-mono uppercase text-slate-400">Pipeline Inflows (7-Day)</span>
              <p className="text-xl font-mono font-bold text-emerald-400">
                +₹{forecast.expected_receivables_7d.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-slate-500">Pending Gateway Settlements</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="text-[11px] font-mono uppercase text-slate-400">Expected Outflows (7-Day)</span>
              <p className="text-xl font-mono font-bold text-rose-400">
                -₹{(forecast.expected_refunds_outflow_7d + forecast.recurring_expenses_7d).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-slate-500">Refunds & Recurring OpEx</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="text-[11px] font-mono uppercase text-slate-400">30-Day Projected Position</span>
              <p className="text-xl font-mono font-bold text-indigo-400">
                ₹{(activeScenario?.projected_30d || forecast.projected_30d).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-indigo-400">
                {activeScenario?.growth_rate_pct ? `${activeScenario.growth_rate_pct > 0 ? "+" : ""}${activeScenario.growth_rate_pct}% Trend` : "Baseline Outlook"}
              </span>
            </div>

          </div>
        )}

        {/* Forecast Chart */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                {activeScenario?.scenario_name || "Base"} 30-Day Liquidity Trajectory
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{activeScenario?.commentary}</p>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1.5 text-indigo-300">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span>Projected Balance</span>
              </span>
              <span className="flex items-center space-x-1.5 text-amber-400">
                <span className="w-2.5 h-0.5 bg-amber-400" />
                <span>Safety Line (₹12L)</span>
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                    color: "#fff"
                  }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, "Projected"]}
                />
                <ReferenceLine y={1200000} stroke="#f59e0b" strokeDasharray="3 3" />
                <Area
                  type="monotone"
                  dataKey="projected_balance"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#balanceGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </main>
    </div>
  );
}
