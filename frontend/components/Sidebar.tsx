"use client";

import React, { useState, useEffect } from "react";
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
  Scale,
  FileCheck2,
  CheckCircle2
} from "lucide-react";
import { DecisionGateModal } from "./DecisionGateModal";
import { BenchmarkModal } from "./BenchmarkModal";
import { AccuracySafetyModal } from "./AccuracySafetyModal";
import { DailyCloseModal } from "./DailyCloseModal";
import { api, DailyCloseResponse } from "@/lib/api";

interface SidebarProps {
  exceptionCount?: number;
  onOpenAuditGate?: () => void;
  onOpenCompliance?: () => void;
  onOpenDailyClose?: () => void;
  onOpenAccuracyCenter?: () => void;
  onRefreshData?: () => void;
}

export function Sidebar({
  exceptionCount = 0,
  onOpenAuditGate,
  onOpenCompliance,
  onOpenDailyClose,
  onOpenAccuracyCenter,
  onRefreshData
}: SidebarProps) {
  const pathname = usePathname();

  // Self-contained modal states for static menu items
  const [isGateOpen, setIsGateOpen] = useState(false);
  const [isComplianceOpen, setIsComplianceOpen] = useState(false);
  const [isAccuracyOpen, setIsAccuracyOpen] = useState(false);
  const [isCloseOpen, setIsCloseOpen] = useState(false);
  const [dailyCloseData, setDailyCloseData] = useState<DailyCloseResponse | null>(null);

  const fetchDailyClose = async () => {
    try {
      const res = await api.getDailyClose();
      setDailyCloseData(res);
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    fetchDailyClose();
  }, []);

  const handleOpenGate = () => {
    if (onOpenAuditGate) onOpenAuditGate();
    else setIsGateOpen(true);
  };

  const handleOpenCompliance = () => {
    if (onOpenCompliance) onOpenCompliance();
    else setIsComplianceOpen(true);
  };

  const handleOpenAccuracy = () => {
    if (onOpenAccuracyCenter) onOpenAccuracyCenter();
    else setIsAccuracyOpen(true);
  };

  const handleOpenClose = () => {
    fetchDailyClose();
    if (onOpenDailyClose) onOpenDailyClose();
    else setIsCloseOpen(true);
  };

  const handleModalRefresh = () => {
    fetchDailyClose();
    if (onRefreshData) onRefreshData();
  };

  const navLinks = [
    { href: "/", label: "Operations Control", icon: Activity },
    { href: "/reconciliation", label: "Reconciliation Ledger", icon: Layers },
    {
      href: "/exceptions",
      label: "Exception Queue",
      icon: AlertTriangle,
      count: exceptionCount > 0 ? exceptionCount : undefined
    },
    { href: "/forecast", label: "Cash Intelligence", icon: TrendingUp },
    { href: "/copilot", label: "Finance Copilot", icon: Sparkles },
    { href: "/dataset", label: "Data Ingestion", icon: Database }
  ];

  return (
    <>
      <aside className="hidden lg:flex w-64 shrink-0 bg-white border-r border-[#E5E7EB] min-h-screen flex-col justify-between p-5 select-none">
        <div className="space-y-6">
          {/* Institutional Bank Escrow Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-900 text-white shadow-xs group-hover:bg-[#3730A3] transition-colors">
              <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <div className="font-heading font-bold text-base tracking-tight text-slate-900 flex items-center space-x-1.5">
                <span>RECONOPS</span>
              </div>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Axis Bank Nodal · *7849
              </p>
            </div>
          </Link>

          {/* Primary Navigation Menu */}
          <div className="space-y-1">
            <div className="text-[10px] font-heading font-bold uppercase tracking-wider text-slate-400 px-3 pb-1.5">
              Core Operations
            </div>

            <nav className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`min-h-[42px] flex items-center justify-between px-3.5 py-2 rounded-xl text-xs transition-all ${
                      isActive
                        ? "bg-slate-900 text-white font-semibold shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-[#F5F6F3]"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`w-4 h-4 stroke-[1.75] ${isActive ? "text-white" : "text-slate-500"}`} />
                      <span>{link.label}</span>
                    </div>

                    {link.count !== undefined && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          isActive
                            ? "bg-rose-500 text-white"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {link.count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Static Operations Controls on Menu */}
          <div className="space-y-1 pt-2 border-t border-[#E5E7EB]">
            <div className="text-[10px] font-heading font-bold uppercase tracking-wider text-slate-400 px-3 pb-1.5">
              Operations Controls
            </div>

            <div className="space-y-1">
              {/* Static 3-Way Audit Gate */}
              <button
                onClick={handleOpenGate}
                className="w-full min-h-[38px] flex items-center space-x-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-[#F5F6F3] rounded-xl transition-colors text-left cursor-pointer border-0 bg-transparent"
              >
                <Scale className="w-4 h-4 text-slate-500 stroke-[1.75]" />
                <span>3-Way Audit Gate</span>
              </button>

              {/* Static Compliance Report */}
              <button
                onClick={handleOpenCompliance}
                className="w-full min-h-[38px] flex items-center space-x-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-[#F5F6F3] rounded-xl transition-colors text-left cursor-pointer border-0 bg-transparent"
              >
                <FileCheck2 className="w-4 h-4 text-slate-500 stroke-[1.75]" />
                <span>Compliance Report</span>
              </button>

              {/* Static Audit & Governance */}
              <button
                onClick={handleOpenAccuracy}
                className="w-full min-h-[38px] flex items-center space-x-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-[#F5F6F3] rounded-xl transition-colors text-left cursor-pointer border-0 bg-transparent"
              >
                <ShieldCheck className="w-4 h-4 text-slate-500 stroke-[1.75]" />
                <span>Audit &amp; Governance</span>
              </button>

              {/* Static Execute Period Close */}
              <button
                onClick={handleOpenClose}
                className="w-full min-h-[40px] flex items-center space-x-2.5 px-3.5 py-2 text-xs font-semibold text-[#3730A3] hover:bg-indigo-50/70 border border-indigo-100 rounded-xl transition-colors text-left cursor-pointer mt-1"
              >
                <CheckCircle2 className="w-4 h-4 text-[#3730A3] stroke-[1.75]" />
                <span>Execute Period Close</span>
              </button>
            </div>
          </div>
        </div>

        {/* Institutional System Status Footer */}
        <div className="p-3.5 rounded-xl bg-[#F5F6F3] border border-[#E5E7EB] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-[11px]">Gateway</span>
            <span className="flex items-center space-x-1.5 font-medium text-slate-800 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>Razorpay Prod</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-[11px]">Nodal Escrow</span>
            <span className="font-mono text-slate-800 text-[11px] font-semibold">Axis (*7849)</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-[#E5E7EB]/60">
            <span className="text-slate-400 text-[10px]">Clearing SLA</span>
            <span className="text-slate-600 text-[10px] font-mono">T+1 RBI Window</span>
          </div>
        </div>
      </aside>

      {/* Static Modals rendered by Sidebar if self-managed */}
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
        onRefresh={handleModalRefresh}
      />
    </>
  );
}
