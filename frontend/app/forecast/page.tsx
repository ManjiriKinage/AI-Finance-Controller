"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import {
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  ShieldCheck,
  Sparkles,
  Calendar,
  AlertTriangle,
  Zap,
  HelpCircle
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  ReferenceLine
} from "recharts";
import { api, CashForecast } from "@/lib/api";

export default function ForecastPage() {
  const [forecast, setForecast] = useState<CashForecast | null>(null);
  const [activeScenario, setActiveScenario] = useState<"Optimistic" | "Base" | "Conservative">("Base");
  const [loading, setLoading] = useState(true);

  const loadForecast = async () => {
    try {
      setLoading(true);
      const data = await api.getForecast();
      setForecast(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForecast();
  }, []);

  const scenarioData = forecast?.scenarios?.[activeScenario];
  const chartData = scenarioData?.daily_curve || forecast?.daily_forecasts || [];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
              <span>Cash Intelligence & 3-Scenario Forecasting</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              30-Day runway projections across Optimistic, Base, and Conservative liquidity scenarios
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1.5 text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Forecast Confidence: {forecast?.confidence_score || 86.5}%</span>
            </span>
          </div>
        </div>

        {/* 4 KPI Summary Cards */}
        {forecast && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Liquid Cash</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                ₹{forecast.current_cash.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified in Bank Statement</span>
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pipeline Settlements Inflow</p>
              <h3 className="mt-2 text-2xl font-bold text-emerald-400">
                +₹{forecast.pending_settlements_inflow.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Processed Razorpay Payouts (T+1/T+2)</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Expected 7-Day Outflows</p>
              <h3 className="mt-2 text-2xl font-bold text-rose-400">
                -₹{(forecast.expected_refunds_outflow_7d + forecast.recurring_expenses_7d).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Refund reserve + Fixed OpEx baseline</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Projected 30-Day Outlook</p>
              <h3 className="mt-2 text-2xl font-bold text-indigo-400">
                ₹{((scenarioData?.projected_30d || forecast.projected_30d) / 100000).toFixed(2)}L
              </h3>
              <p className="text-[11px] text-indigo-400 font-medium mt-1">
                Scenario: {activeScenario} ({(scenarioData?.growth_rate_pct ?? 0) > 0 ? "+" : ""}{scenarioData?.growth_rate_pct ?? 0}%)
              </p>
            </div>

          </div>
        )}

        {/* 3-Scenario Switcher & Warning Strip */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">30-Day Scenario Modeling</h3>
              <p className="text-xs text-slate-400">Select scenario to project runway sensitivity</p>
            </div>

            <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {(["Optimistic", "Base", "Conservative"] as const).map((sc) => (
                <button
                  key={sc}
                  onClick={() => setActiveScenario(sc)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeScenario === sc
                      ? sc === "Conservative"
                        ? "bg-rose-600 text-white shadow-md"
                        : "bg-indigo-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {sc}
                </button>
              ))}
            </div>
          </div>

          {/* Scenario Description & Safety Threshold Alert */}
          {scenarioData && (
            <div className={`p-4 rounded-xl border flex items-start space-x-3 text-xs leading-relaxed ${
              scenarioData.is_threshold_breached
                ? "bg-rose-950/30 border-rose-600/40 text-rose-300"
                : "bg-indigo-950/30 border-indigo-700/40 text-indigo-200"
            }`}>
              {scenarioData.is_threshold_breached ? (
                <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Sparkles className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <strong className="block text-white mb-0.5">{scenarioData.scenario_name} Scenario Analysis:</strong>
                {scenarioData.commentary}
              </div>
            </div>
          )}
        </div>

        {/* Forecast Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Projected Cash Curve Chart with Safety Line */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Projected Cash Balance Curve</h3>
                <p className="text-xs text-slate-400">With ₹12.0L Minimum Liquidity Safety Line</p>
              </div>
            </div>

            <div className="h-72 w-full">
              {chartData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={activeScenario === "Conservative" ? "#f43f5e" : "#6366f1"} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={activeScenario === "Conservative" ? "#f43f5e" : "#6366f1"} stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                      formatter={(val: any) => [`₹${Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, ""]}
                    />
                    <ReferenceLine y={forecast?.safety_threshold || 1200000} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: "Safety Threshold (₹12L)", fill: "#f43f5e", fontSize: 10 }} />
                    <Area
                      type="monotone"
                      dataKey="projected_balance"
                      stroke={activeScenario === "Conservative" ? "#f43f5e" : "#818cf8"}
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorBalance)"
                      name="Projected Balance"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Daily Inflows vs Outflows Bar Chart */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Inflow vs Outflow Velocity</h3>
                <p className="text-xs text-slate-400">Daily settlement batches vs refunds & expenses</p>
              </div>
            </div>

            <div className="h-72 w-full">
              {chartData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.slice(0, 14)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                      formatter={(val: any) => [`₹${Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, ""]}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                    <Bar dataKey="expected_inflow" fill="#10b981" name="Inflow" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expected_outflow" fill="#f43f5e" name="Outflow" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
