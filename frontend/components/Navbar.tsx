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
  Menu,
  X,
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

  const navLinks = [
    { href: "/", label: "Executive Overview", icon: Activity },
    { href: "/reconciliation", label: "Reconciliation Ledger", icon: Layers },
    { href: "/exceptions", label: "Exception Queue", icon: AlertTriangle, badge: "Active" },
    { href: "/forecast", label: "Cash Intelligence", icon: TrendingUp },
    { href: "/copilot", label: "Finance Copilot", icon: Sparkles },
    { href: "/dataset", label: "Data Ingestion", icon: Database }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 shrink-0">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 shadow-inner group-hover:border-indigo-400 transition-colors">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <span className="font-semibold text-sm tracking-tight text-white font-mono uppercase">
                    ReconOps
                  </span>
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.2 text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse"></span>
                    Verified
                  </span>
                </div>
                <span className="hidden lg:block text-[10px] text-slate-500">Autonomous Finance Cloud</span>
              </div>
            </Link>
          </div>

          {/* Desktop & Tablet Navigation Tabs (>= 1024px) */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-slate-800 text-white border border-slate-700/60 shadow-xs"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="px-1.5 py-0.2 text-[9px] bg-slate-800 text-amber-300 border border-amber-500/30 rounded font-mono">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
            
            {/* Audit & Governance Button (Desktop) */}
            {onOpenAccuracyCenter && (
              <button
                onClick={onOpenAccuracyCenter}
                className="hidden xl:flex items-center space-x-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Audit & Governance</span>
              </button>
            )}

            {/* Primary Action Button: Execute Period Close */}
            {onOpenDailyClose && (
              <button
                onClick={onOpenDailyClose}
                className="flex items-center space-x-1.5 px-3 sm:px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-all cursor-pointer"
              >
                <FileCheck2 className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Execute Period Close</span>
                <span className="sm:hidden">Close Period</span>
              </button>
            )}

            {/* Sync Feeds */}
            <button
              onClick={handleQuickRecon}
              disabled={isSyncing}
              className="flex items-center space-x-1.5 px-2.5 py-2 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-all disabled:opacity-50 cursor-pointer"
              title="Sync gateway settlements and bank transaction feeds"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isSyncing ? "animate-spin text-indigo-400" : ""}`} />
              <span className="hidden md:inline">{isSyncing ? "Syncing..." : "Sync Feeds"}</span>
            </button>

            {/* Mobile Hamburger Toggle Button (< 1024px) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 focus:outline-hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-indigo-400" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile & Tablet Slide-Down Navigation Drawer (< 1024px) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800/90 bg-slate-950/98 backdrop-blur-xl px-4 py-4 space-y-2 shadow-2xl animate-fade-in">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 px-3 pb-1">
            Navigation Menu
          </div>
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-slate-800/90 text-white border border-slate-700/80 shadow-xs"
                      : "text-slate-300 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                    <span>{link.label}</span>
                  </div>
                  {link.badge ? (
                    <span className="px-2 py-0.5 text-[10px] bg-slate-800 text-amber-300 border border-amber-500/30 rounded font-mono">
                      {link.badge}
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Secondary Action */}
          {onOpenAccuracyCenter && (
            <div className="pt-2 border-t border-slate-800/80">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAccuracyCenter();
                }}
                className="w-full flex items-center justify-center space-x-2 px-3.5 py-3 text-sm font-medium rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/60"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Audit & Model Performance</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
