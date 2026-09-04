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
  Cpu,
  FileCheck2,
  Crosshair
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
      setTimeout(() => setIsSyncing(false), 600);
    }
  };

  const navLinks = [
    { href: "/", label: "Executive Overview", icon: Activity },
    { href: "/reconciliation", label: "3-Way Recon", icon: Layers },
    { href: "/exceptions", label: "Exception Center", icon: AlertTriangle, badge: "Live" },
    { href: "/forecast", label: "Cash Intelligence", icon: TrendingUp },
    { href: "/copilot", label: "Controller Copilot", icon: Sparkles, highlight: true },
    { href: "/dataset", label: "Datasets & Benchmark", icon: Database }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 shadow-md shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">AI FINANCE CONTROLLER</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                  Verified Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Razorpay ⟷ Bank ⟷ Accounting Verification</p>
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
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-slate-800 text-white border border-slate-700/80 shadow-sm"
                      : link.highlight
                      ? "text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : ""}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="px-1.5 py-0.2 text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full font-bold animate-pulse">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions & Status */}
          <div className="flex items-center space-x-2.5">
            
            {/* Accuracy & Safety Center Button */}
            {onOpenAccuracyCenter && (
              <button
                onClick={onOpenAccuracyCenter}
                className="hidden xl:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/40 shadow-sm transition-all cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Accuracy & Safety</span>
              </button>
            )}

            {/* Signature "RUN AI DAILY CLOSE" Action Button */}
            {onOpenDailyClose && (
              <button
                onClick={onOpenDailyClose}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-white" />
                <span>AI Daily Close</span>
              </button>
            )}

            <button
              onClick={handleQuickRecon}
              disabled={isSyncing}
              className="flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Syncing..." : "Recon"}</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
