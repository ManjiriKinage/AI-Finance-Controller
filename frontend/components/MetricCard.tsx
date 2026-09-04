"use client";

import React from "react";
import { LucideIcon, ArrowUpRight, HelpCircle } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  statusColor?: "emerald" | "amber" | "rose" | "indigo" | "slate";
  onClick?: () => void;
  clickableText?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true,
  statusColor = "slate",
  onClick,
  clickableText
}: MetricCardProps) {
  const dotColorMap = {
    emerald: "bg-emerald-400",
    amber: "bg-amber-400",
    rose: "bg-rose-400",
    indigo: "bg-indigo-400",
    slate: "bg-slate-400"
  };

  return (
    <div className="relative rounded-2xl bg-slate-900/70 border border-slate-800 p-5 shadow-xs transition-all hover:border-slate-700/80 flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${dotColorMap[statusColor]}`} />
            <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">{title}</span>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-800/60 border border-slate-700/40 text-slate-400 group-hover:text-slate-200 transition-colors">
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold tracking-tight text-white font-mono">{value}</span>
          {trend && (
            <span
              className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                trendPositive
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
        <span className="text-slate-400 truncate max-w-[140px] sm:max-w-[180px]">{subtitle}</span>
        {onClick && (
          <button
            onClick={onClick}
            className="flex items-center space-x-1 text-slate-400 hover:text-indigo-300 font-medium transition-colors cursor-pointer group/btn"
          >
            <span>{clickableText || "Details"}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover/btn:text-indigo-300 transition-transform group-hover/btn:translate-x-0.5" />
          </button>
        )}
      </div>
    </div>
  );
}
