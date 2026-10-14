"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  RefreshCw,
  Search,
  Bell,
  Menu,
  X
} from "lucide-react";
import { api } from "@/lib/api";

interface NavbarProps {
  onReconcileTrigger?: () => void;
  onOpenBenchmark?: () => void;
  onOpenDailyClose?: () => void;
  onOpenAccuracyCenter?: () => void;
}

export function Navbar({ onReconcileTrigger, onOpenBenchmark, onOpenDailyClose, onOpenAccuracyCenter }: NavbarProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleQuickRecon = async () => {
    try {
      setIsSyncing(true);
      await api.runReconciliation();
      if (onReconcileTrigger) onReconcileTrigger();
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  return (
    <header className="lg:hidden sticky top-0 z-30 w-full bg-white border-b border-[#E5E7EB]">
      <div className="px-4 py-2.5 flex items-center justify-between">
        
        {/* Brand */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white">
            <ShieldCheck className="w-4 h-4 stroke-[1.5]" />
          </div>
          <span className="font-heading font-bold text-base tracking-tight text-slate-900">
            RECONOPS
          </span>
        </Link>

        {/* Top Header Actions */}
        <div className="flex items-center space-x-1.5">
          {/* Sync Button */}
          <button
            onClick={handleQuickRecon}
            disabled={isSyncing}
            aria-label="Sync feeds"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-700 hover:bg-[#F5F6F3] border border-[#E5E7EB] transition-colors cursor-pointer disabled:opacity-50"
            title="Sync gateway settlements and bank transaction feeds"
          >
            <RefreshCw className={`w-4 h-4 stroke-[1.5] ${isSyncing ? "animate-spin text-[#3730A3]" : ""}`} />
          </button>

          {/* Search Button */}
          <button
            onClick={onOpenBenchmark}
            aria-label="Search records"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-700 hover:bg-[#F5F6F3] border border-[#E5E7EB] transition-colors cursor-pointer"
            title="Search records and benchmarks"
          >
            <Search className="w-4 h-4 stroke-[1.5]" />
          </button>

          {/* Audit & Governance Pill */}
          {onOpenAccuracyCenter && (
            <button
              onClick={onOpenAccuracyCenter}
              className="min-h-[44px] hidden sm:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white hover:bg-[#F5F6F3] text-slate-700 border border-[#E5E7EB] transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 stroke-[1.5] text-slate-500" />
              <span>Audit</span>
            </button>
          )}

          {/* Close Period Pill */}
          {onOpenDailyClose && (
            <button
              onClick={onOpenDailyClose}
              className="min-h-[44px] flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#3730A3] hover:bg-[#312E81] text-white transition-colors cursor-pointer"
            >
              <span>Close Period</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
