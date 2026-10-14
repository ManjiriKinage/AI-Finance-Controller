"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
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
                  <TrendingUp className="w-5 h-5 text-[#3730A3] stroke-[1.5]" />
                  <span>Cash Intelligence & Treasury Forecast</span>
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Multi-scenario 30-day runway projection based on verified bank liquidity and pending gateway settlements
                </p>
              </div>

              {/* Scenario Selector */}
              <div className="flex items-center space-x-1.5">
                {[
                  { id: "base", label: "Base Case" },
                  { id: "optimistic", label: "Optimistic (+28%)" },
                  { id: "conservative", label: "Conservative (-18%)" }
                ].map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => setSelectedScenario(sc.id)}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl font-medium text-xs transition-colors cursor-pointer ${
                      selectedScenario === sc.id
                        ? "bg-slate-900 text-white font-semibold"
                        : "bg-white text-slate-600 hover:text-slate-900 hover:bg-[#F5F6F3] border border-[#E5E7EB]"
                    }`}
                  >
                    {sc.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4 Summary KPI Cards */}
          {forecast && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Card 1 */}
              <div className="bg-white border border-[#E5E7EB] border-t-[3px] border-t-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-none space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-medium">Liquid Cash in Bank</span>
                <p className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
                  ₹{forecast.current_cash.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
                <span className="text-xs text-slate-500">Verified Axis Bank Balance</span>
              </div>

              {/* Card 2 */}
              <div className="bg-white border border-[#E5E7EB] border-t-[3px] border-t-emerald-600 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-none space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-medium">Pipeline Inflows (7-Day)</span>
                <p className="text-2xl font-mono font-bold text-emerald-800 tabular-nums">
                  +₹{forecast.expected_receivables_7d.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
                <span className="text-xs text-slate-500">Pending Gateway Settlements</span>
              </div>

              {/* Card 3 */}
              <div className="bg-white border border-[#E5E7EB] border-t-[3px] border-t-red-600 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-none space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-medium">Expected Outflows (7-Day)</span>
                <p className="text-2xl font-mono font-bold text-red-600 tabular-nums">
                  -₹{(forecast.expected_refunds_outflow_7d + forecast.recurring_expenses_7d).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
                <span className="text-xs text-slate-500">Refunds & Recurring OpEx</span>
              </div>

              {/* Card 4 */}
              <div className="bg-white border border-[#E5E7EB] border-t-[3px] border-t-[#3730A3] rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-none space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-medium">30-Day Projected Position</span>
                <p className="text-2xl font-mono font-bold text-[#3730A3] tabular-nums">
                  ₹{(activeScenario?.projected_30d || forecast.projected_30d).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
                <span className="text-xs font-medium text-slate-600">
                  {activeScenario?.growth_rate_pct ? `${activeScenario.growth_rate_pct > 0 ? "+" : ""}${activeScenario.growth_rate_pct}% Trend` : "Baseline Outlook"}
                </span>
              </div>

            </div>
          )}

          {/* Forecast Chart Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-none space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-slate-900">
                  {activeScenario?.scenario_name || "Base"} 30-Day Liquidity Trajectory
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">{activeScenario?.commentary}</p>
              </div>

              <div className="flex items-center space-x-4 text-xs font-medium">
                <span className="flex items-center space-x-1.5 text-[#3730A3]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3730A3]" />
                  <span>Projected Balance</span>
                </span>
                <span className="flex items-center space-x-1.5 text-amber-600">
                  <span className="w-2.5 h-0.5 bg-amber-600" />
                  <span>Safety Line (₹12L)</span>
                </span>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderColor: "#E5E7EB",
                      borderRadius: "1rem",
                      boxShadow: "none",
                      fontSize: "12px",
                      color: "#0F172A"
                    }}
                    formatter={(val: any) => [`₹${Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, "Projected"]}
                  />
                  <ReferenceLine y={1200000} stroke="#D97706" strokeDasharray="3 3" />
                  <Area
                    type="monotone"
                    dataKey="projected_balance"
                    stroke="#3730A3"
                    strokeWidth={2}
                    fillOpacity={0.08}
                    fill="#3730A3"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </main>
      </div>

    </div>
  );
}
