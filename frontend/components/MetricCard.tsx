"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  topEdgeColor?: "blue" | "emerald" | "amber" | "red";
  onClick?: () => void;
  clickableText?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  topEdgeColor = "blue",
  onClick,
  clickableText
}: MetricCardProps) {
  const topEdgeColorMap = {
    blue: "border-t-[#2563EB]",
    emerald: "border-t-[#059669]",
    amber: "border-t-[#D97706]",
    red: "border-t-[#DC2626]"
  };

  return (
    <div
      className={`bg-white border border-[#E5E7EB] ${topEdgeColorMap[topEdgeColor]} border-t-[3px] rounded-2xl p-5 flex flex-col justify-between transition-colors hover:border-[#CBD5E1]`}
    >
      <div>
        {/* Title */}
        <span className="text-[11px] font-heading font-semibold text-slate-500 uppercase tracking-wider block">
          {title}
        </span>

        {/* Big Number in Tabular Numerals */}
        <div className="mt-3">
          <span className="text-2xl sm:text-3xl font-heading font-bold tracking-tight text-slate-900 tabular-nums">
            {value}
          </span>
        </div>

        {/* One line of context */}
        {subtitle && (
          <p className="text-xs text-slate-500 mt-1 truncate">
            {subtitle}
          </p>
        )}
      </div>

      {/* One link */}
      {onClick && clickableText && (
        <div className="mt-4 pt-3 border-t border-[#E5E7EB]">
          <button
            onClick={onClick}
            className="min-h-[44px] -my-2 flex items-center space-x-1 text-xs font-semibold text-[#3730A3] hover:text-[#312E81] transition-colors cursor-pointer group"
          >
            <span>{clickableText}</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[1.5] transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      )}
    </div>
  );
}
