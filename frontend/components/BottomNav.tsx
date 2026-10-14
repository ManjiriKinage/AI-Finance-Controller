"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Layers, AlertTriangle, FileCheck2, MoreHorizontal } from "lucide-react";

interface BottomNavProps {
  exceptionCount?: number;
  onOpenDailyClose?: () => void;
}

export function BottomNav({ exceptionCount = 6, onOpenDailyClose }: BottomNavProps) {
  const pathname = usePathname();

  const tabs = [
    { href: "/", label: "Overview", icon: Activity },
    { href: "/reconciliation", label: "Ledger", icon: Layers },
    { href: "/exceptions", label: "Exceptions", icon: AlertTriangle, count: exceptionCount },
    { href: "#close", label: "Close", icon: FileCheck2, onClick: onOpenDailyClose },
    { href: "/dataset", label: "More", icon: MoreHorizontal }
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5E7EB] px-2 py-1 lg:hidden"
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.href === pathname;

          return tab.onClick ? (
            <button
              key={tab.label}
              onClick={tab.onClick}
              className="min-h-[44px] min-w-[56px] flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-500 hover:text-slate-800 transition-colors relative cursor-pointer border-0 bg-transparent"
            >
              <Icon className="w-5 h-5 stroke-[1.75] text-slate-500" />
              <span className="text-[10px] mt-1 text-slate-500 font-medium">
                {tab.label}
              </span>
            </button>
          ) : (
            <Link
              key={tab.label}
              href={tab.href}
              className={`min-h-[44px] min-w-[56px] flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors relative ${
                isActive
                  ? "text-[#3730A3] font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 stroke-[1.75] ${isActive ? "text-[#3730A3]" : "text-slate-500"}`} />
                {tab.count !== undefined && (
                  <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-[#9F1239] text-white">
                    {tab.count}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 ${isActive ? "text-[#3730A3] font-bold" : "text-slate-500 font-medium"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
