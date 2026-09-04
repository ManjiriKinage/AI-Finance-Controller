import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  statusColor?: "emerald" | "indigo" | "amber" | "rose";
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
  statusColor = "emerald",
  onClick,
  clickableText
}: MetricCardProps) {
  const colorMap = {
    emerald: {
      bg: "from-emerald-500/10 to-transparent",
      border: "border-emerald-500/20",
      iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      glow: "hover:border-emerald-500/40"
    },
    indigo: {
      bg: "from-indigo-500/10 to-transparent",
      border: "border-indigo-500/20",
      iconBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      glow: "hover:border-indigo-500/40"
    },
    amber: {
      bg: "from-amber-500/10 to-transparent",
      border: "border-amber-500/20",
      iconBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      glow: "hover:border-amber-500/40"
    },
    rose: {
      bg: "from-rose-500/10 to-transparent",
      border: "border-rose-500/20",
      iconBg: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      glow: "hover:border-rose-500/40"
    }
  };

  const scheme = colorMap[statusColor];

  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-2xl bg-gradient-to-b ${scheme.bg} bg-slate-900/80 border ${scheme.border} ${scheme.glow} transition-all duration-200 backdrop-blur-sm ${
        onClick ? "cursor-pointer group hover:scale-[1.01]" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-xl border ${scheme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              trendPositive
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
            }`}
          >
            {trend}
          </span>
        )}
        {clickableText && (
          <span className="text-xs font-medium text-indigo-400 group-hover:text-indigo-300 group-hover:underline flex items-center space-x-1">
            <span>{clickableText}</span>
            <span>&rarr;</span>
          </span>
        )}
      </div>
    </div>
  );
}
