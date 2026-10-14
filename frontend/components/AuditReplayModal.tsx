"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  History,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  RefreshCw,
  Cpu,
  UserCheck,
  Zap
} from "lucide-react";
import { api, AuditReplayResponse } from "@/lib/api";

interface AuditReplayModalProps {
  exceptionId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AuditReplayModal({ exceptionId, isOpen, onClose }: AuditReplayModalProps) {
  const [data, setData] = useState<AuditReplayResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && exceptionId) {
      setLoading(true);
      api.getAuditReplay(exceptionId)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen, exceptionId]);

  if (!isOpen) return null;

  const stageIcons = {
    DETECTION: <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />,
    CLASSIFICATION: <Cpu className="w-3.5 h-3.5 text-[#3730A3] flex-shrink-0" />,
    AI_INVESTIGATION: <Zap className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />,
    EVIDENCE_GATHERED: <ShieldCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />,
    HUMAN_APPROVAL: <UserCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />,
    RECALCULATION: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white border border-[#E4E6E0] p-6 sm:p-8 shadow-none overflow-hidden max-h-[92vh] flex flex-col justify-between space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E4E6E0]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-[#3730A3] border border-indigo-100">
              <History className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
                  Audit Replay & Timeline
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-mono font-medium bg-[#F5F6F3] text-slate-700 border border-[#E4E6E0] rounded-lg">
                  {exceptionId}
                </span>
                {data && (
                  <span className="px-2 py-0.5 text-xs font-mono text-slate-500 bg-[#F5F6F3] rounded-md border border-[#E4E6E0]">
                    {data.lineage_id}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Microsecond-accurate chronological trace of detection, classification, evidence synthesis, and ledger posting
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-[#E4E6E0] text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[1.75]" />
          </button>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#3730A3] animate-spin" />
            <p className="text-sm text-slate-500">Loading immutable audit log events...</p>
          </div>
        ) : data ? (
          <div className="my-2 space-y-4 overflow-y-auto pr-1">

            {/* Timeline Stepper */}
            <div className="relative border-l-2 border-[#E4E6E0] ml-4 pl-6 space-y-5">
              {data.events.map((evt) => (
                <div key={evt.step_index} className="relative group">

                  {/* Step Dot */}
                  <div className="absolute -left-[35px] top-1 flex items-center justify-center w-6 h-6 rounded-full bg-white border border-[#E4E6E0]">
                    {stageIcons[evt.stage as keyof typeof stageIcons] || <Clock className="w-3.5 h-3.5 text-slate-400" />}
                  </div>

                  <div className="p-4 rounded-xl bg-[#F5F6F3] border border-[#E4E6E0] space-y-1.5 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-heading font-bold uppercase tracking-wider text-[#3730A3]">
                        {evt.stage.replace(/_/g, " ")}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] px-2 py-0.5 bg-white text-slate-700 border border-[#E4E6E0] rounded-md font-mono">
                          {evt.actor}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">{evt.timestamp}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed">{evt.description}</p>

                    {/* State Delta Box */}
                    {Object.keys(evt.state_delta).length > 0 && (
                      <div className="mt-2 p-2 rounded-lg bg-white border border-[#E4E6E0] font-mono text-[10px] text-slate-700">
                        <code>{JSON.stringify(evt.state_delta)}</code>
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>

          </div>
        ) : null}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E4E6E0]">
          <div className="text-xs text-slate-500 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Immutable Audit Trail Chained via SQLite Ledger</span>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] px-6 py-2.5 text-xs font-semibold rounded-xl bg-[#3730A3] hover:bg-[#312E81] text-white transition-all cursor-pointer"
          >
            Close Timeline
          </button>
        </div>

      </div>
    </div>
  );
}
