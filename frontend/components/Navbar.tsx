"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Activity,
  Layers,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  Database,
  RefreshCw,
  FileCheck2,
  Lock,
  ChevronRight
} from "lucide-react";
import { api } from "@/lib/api";

interface NavbarProps {
  onReconcileTrigger?: () => void;
  onOpenBenchmark?: () => void;
  onOpenDailyClose?: () => void;
  onOpenAccuracyCenter?: () => void;
}

export function Navbar({ onReconcileTrigger, onOpenBenchmark, onOpenDailyClose, onOpenAccuracyCenter }: NavbarProps) {
  const pathname = usePathname();
  const [isSyncing, setIsSyncing] = useState(false);

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

  const navLinks = [
    { href: "/", label: "Executive Overview", icon: Activity },
    { href: "/reconciliation", label: "Reconciliation Ledger", icon: Layers },
    { href: "/exceptions", label: "Exception Queue", icon: AlertTriangle, badge: "Active" },
    { href: "/forecast", label: "Cash Intelligence", icon: TrendingUp },
    { href: "/copilot", label: "Finance Copilot", icon: Sparkles },
    { href: "/dataset", label: "Data Ingestion", icon: Database }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 shadow-inner">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm tracking-tight text-white font-mono uppercase">
                  ReconOps <span className="text-slate-500 font-sans font-normal text-xs">| Autonomous Finance Cloud</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                  Verified
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-slate-800 text-white border border-slate-700/60 shadow-xs"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="px-1.5 py-0.2 text-[9px] bg-slate-800 text-amber-300 border border-amber-500/30 rounded-md font-mono">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions & Status */}
          <div className="flex items-center space-x-2.5">
            
            {/* Audit & Governance Button */}
            {onOpenAccuracyCenter && (
              <button
                onClick={onOpenAccuracyCenter}
                className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Audit & Governance</span>
              </button>
            )}

            {/* Primary Action Button: Execute Period Close */}
            {onOpenDailyClose && (
              <button
                onClick={onOpenDailyClose}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-all cursor-pointer"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Execute Period Close</span>
              </button>
            )}

            {/* Sync Feeds */}
            <button
              onClick={handleQuickRecon}
              disabled={isSyncing}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-all disabled:opacity-50 cursor-pointer"
              title="Sync gateway settlements and bank transaction feeds"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isSyncing ? "animate-spin text-indigo-400" : ""}`} />
              <span>{isSyncing ? "Syncing..." : "Sync Feeds"}</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
