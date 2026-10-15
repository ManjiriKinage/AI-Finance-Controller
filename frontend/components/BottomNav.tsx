"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Layers,
  AlertTriangle,
  TrendingUp,
  MoreHorizontal,
  Sparkles,
  Database,
  Scale,
  FileCheck2,
  ShieldCheck,
  CheckCircle2,
  X,
  ChevronRight
} from "lucide-react";
import { DecisionGateModal } from "./DecisionGateModal";
import { BenchmarkModal } from "./BenchmarkModal";
import { AccuracySafetyModal } from "./AccuracySafetyModal";
import { DailyCloseModal } from "./DailyCloseModal";
import { api, DailyCloseResponse } from "@/lib/api";

interface BottomNavProps {
  exceptionCount?: number;
  onOpenDailyClose?: () => void;
}

export function BottomNav({ exceptionCount, onOpenDailyClose }: BottomNavProps) {
  const pathname = usePathname();

  // More drawer state
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Self-contained modal states
  const [isGateOpen, setIsGateOpen] = useState(false);
  const [isComplianceOpen, setIsComplianceOpen] = useState(false);
  const [isAccuracyOpen, setIsAccuracyOpen] = useState(false);
  const [isCloseOpen, setIsCloseOpen] = useState(false);
  const [dailyCloseData, setDailyCloseData] = useState<DailyCloseResponse | null>(null);

  // Dynamic exception count for badge
  const [liveExceptionCount, setLiveExceptionCount] = useState<number>(exceptionCount ?? 6);

  const fetchDailyClose = async () => {
    try {
      const res = await api.getDailyClose();
      setDailyCloseData(res);
    } catch {
      // fallback
    }
  };

  const fetchExceptionsCount = async () => {
    try {
      const data = await api.getExceptions();
      const pending = data.filter((e) => e.status !== "RESOLVED" && e.status !== "REJECTED");
      setLiveExceptionCount(pending.length);
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    fetchDailyClose();
    if (exceptionCount === undefined) {
      fetchExceptionsCount();
    } else {
      setLiveExceptionCount(exceptionCount);
    }
  }, [pathname, exceptionCount]);

  // Close drawer on path change
  useEffect(() => {
    setIsMoreOpen(false);
  }, [pathname]);

  const handleOpenGate = () => {
    setIsMoreOpen(false);
    setIsGateOpen(true);
  };

  const handleOpenCompliance = () => {
    setIsMoreOpen(false);
    setIsComplianceOpen(true);
  };

  const handleOpenAccuracy = () => {
    setIsMoreOpen(false);
    setIsAccuracyOpen(true);
  };

  const handleOpenClose = () => {
    setIsMoreOpen(false);
    fetchDailyClose();
    if (onOpenDailyClose) {
      onOpenDailyClose();
    } else {
      setIsCloseOpen(true);
    }
  };

  const primaryTabs = [
    { href: "/", label: "Overview", icon: Activity },
    { href: "/reconciliation", label: "Ledger", icon: Layers },
    {
      href: "/exceptions",
      label: "Exceptions",
      icon: AlertTriangle,
      count: liveExceptionCount > 0 ? liveExceptionCount : undefined
    },
    { href: "/forecast", label: "Forecast", icon: TrendingUp }
  ];

  const isMoreActive =
    pathname === "/copilot" ||
    pathname === "/dataset" ||
    isMoreOpen;

  return (
    <>
      {/* Mobile Base Menu - Fixed/Static across all pages */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] px-2 py-1 lg:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-[calc(0.25rem+env(safe-area-inset-bottom,0px))]"
      >
        <div className="max-w-md mx-auto flex items-center justify-around">
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.href === pathname;

            return (
              <Link
                key={tab.label}
                href={tab.href}
                className={`min-h-[46px] min-w-[56px] flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
                  isActive
                    ? "text-[#3730A3] font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 stroke-[1.85] transition-transform duration-150 ${
                      isActive ? "text-[#3730A3] scale-110" : "text-slate-500"
                    }`}
                  />
                  {tab.count !== undefined && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-mono font-bold bg-[#9F1239] text-white flex items-center justify-center shadow-xs">
                      {tab.count}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] mt-1 tracking-tight ${
                    isActive ? "text-[#3730A3] font-bold" : "text-slate-500 font-medium"
                  }`}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-[#3730A3] mt-0.5" />
                )}
              </Link>
            );
          })}

          {/* More Operations Tab */}
          <button
            type="button"
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className={`min-h-[46px] min-w-[56px] flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative cursor-pointer border-0 bg-transparent ${
              isMoreActive
                ? "text-[#3730A3] font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
            aria-label="More navigation options"
            aria-expanded={isMoreOpen}
          >
            <div className="relative">
              <MoreHorizontal
                className={`w-5 h-5 stroke-[1.85] transition-transform duration-150 ${
                  isMoreActive ? "text-[#3730A3] scale-110" : "text-slate-500"
                }`}
              />
            </div>
            <span
              className={`text-[10px] mt-1 tracking-tight ${
                isMoreActive ? "text-[#3730A3] font-bold" : "text-slate-500 font-medium"
              }`}
            >
              More
            </span>
            {isMoreActive && (
              <span className="w-1 h-1 rounded-full bg-[#3730A3] mt-0.5" />
            )}
          </button>
        </div>
      </nav>

      {/* More Operations Mobile Bottom Sheet */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden animate-fade-in">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMoreOpen(false)}
          />

          {/* Bottom Sheet Modal */}
          <div className="relative z-10 w-full max-w-lg mx-auto bg-white rounded-t-2xl border-t border-[#E5E7EB] p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
            {/* Sheet Handle & Header */}
            <div className="flex flex-col items-center pb-2 border-b border-[#E5E7EB]">
              <div className="w-10 h-1 rounded-full bg-slate-200 mb-3" />
              <div className="w-full flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900">
                    Operations &amp; Controls
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Axis Bank Nodal · *7849
                  </p>
                </div>
                <button
                  onClick={() => setIsMoreOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4 stroke-[2]" />
                </button>
              </div>
            </div>

            {/* Additional Pages */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-1">
                Extended Modules
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                <Link
                  href="/copilot"
                  onClick={() => setIsMoreOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                    pathname === "/copilot"
                      ? "bg-indigo-50 border-indigo-200 text-[#3730A3] font-semibold"
                      : "bg-[#F5F6F3]/60 border-[#E5E7EB] text-slate-700 hover:bg-[#F5F6F3]"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-[#3730A3] flex items-center justify-center">
                      <Sparkles className="w-4 h-4 stroke-[1.75]" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Finance Copilot</p>
                      <p className="text-[10px] text-slate-500">Autonomous root-cause &amp; AI triage</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  href="/dataset"
                  onClick={() => setIsMoreOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                    pathname === "/dataset"
                      ? "bg-indigo-50 border-indigo-200 text-[#3730A3] font-semibold"
                      : "bg-[#F5F6F3]/60 border-[#E5E7EB] text-slate-700 hover:bg-[#F5F6F3]"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                      <Database className="w-4 h-4 stroke-[1.75]" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Data Ingestion</p>
                      <p className="text-[10px] text-slate-500">Gateway settlements &amp; ledger feeds</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>
            </div>

            {/* Governance & Operations Actions */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-1">
                Operations Controls &amp; Governance
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  type="button"
                  onClick={handleOpenClose}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs font-semibold text-[#3730A3] hover:bg-indigo-100/70 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-[#3730A3] text-white flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 stroke-[2]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#3730A3]">Execute Period Close</p>
                      <p className="text-[10px] text-indigo-700/80 font-normal">SLA verification &amp; final signoff</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#3730A3]" />
                </button>

                <button
                  type="button"
                  onClick={handleOpenGate}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-[#E5E7EB] text-xs font-medium text-slate-700 hover:bg-[#F5F6F3] transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                      <Scale className="w-4 h-4 stroke-[1.75]" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">3-Way Audit Gate</p>
                      <p className="text-[10px] text-slate-500">Order, settlement &amp; bank ledger verification</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={handleOpenCompliance}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-[#E5E7EB] text-xs font-medium text-slate-700 hover:bg-[#F5F6F3] transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                      <FileCheck2 className="w-4 h-4 stroke-[1.75]" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Compliance Report</p>
                      <p className="text-[10px] text-slate-500">RBI benchmark metrics &amp; operational audit</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={handleOpenAccuracy}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-[#E5E7EB] text-xs font-medium text-slate-700 hover:bg-[#F5F6F3] transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 stroke-[1.75]" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Audit &amp; Governance</p>
                      <p className="text-[10px] text-slate-500">Stress testing, edge cases &amp; model safety</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Institutional System Status Footer */}
            <div className="p-3 rounded-xl bg-[#F5F6F3] border border-[#E5E7EB] flex items-center justify-between text-[11px] text-slate-600 font-mono">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Razorpay Prod</span>
              </span>
              <span>T+1 RBI Clearing</span>
            </div>
          </div>
        </div>
      )}

      {/* Static Modals rendered by BottomNav if opened on mobile */}
      <DecisionGateModal
        resultId={1}
        isOpen={isGateOpen}
        onClose={() => setIsGateOpen(false)}
      />

      <BenchmarkModal
        isOpen={isComplianceOpen}
        onClose={() => setIsComplianceOpen(false)}
      />

      <AccuracySafetyModal
        isOpen={isAccuracyOpen}
        onClose={() => setIsAccuracyOpen(false)}
      />

      <DailyCloseModal
        isOpen={isCloseOpen}
        onClose={() => setIsCloseOpen(false)}
        dailyCloseData={dailyCloseData}
        onRefresh={() => {
          fetchDailyClose();
          fetchExceptionsCount();
        }}
      />
    </>
  );
}
