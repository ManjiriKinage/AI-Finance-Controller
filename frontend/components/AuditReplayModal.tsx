"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  History,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
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
    DETECTION: <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />,
    CLASSIFICATION: <Cpu className="w-4 h-4 text-indigo-400 flex-shrink-0" />,
    AI_INVESTIGATION: <Zap className="w-4 h-4 text-purple-400 flex-shrink-0" />,
    EVIDENCE_GATHERED: <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />,
    HUMAN_APPROVAL: <UserCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />,
    RECALCULATION: <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-600 text-white shadow-lg shadow-indigo-500/20">
              <History className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Audit Replay & Timeline</h2>
                <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-slate-800 text-indigo-300 border border-indigo-500/30 rounded-full">
                  {exceptionId}
                </span>
                {data && (
                  <span className="px-2 py-0.5 text-xs font-mono text-slate-400 bg-slate-950 rounded-md border border-slate-800">
                    {data.lineage_id}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Microsecond-accurate chronological trace of detection, classification, evidence synthesis, and ledger posting
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-sm text-slate-400">Loading immutable audit log events...</p>
          </div>
        ) : data ? (
          <div className="my-6 space-y-4 overflow-y-auto pr-1">
            
            {/* Timeline Stepper */}
            <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-5">
              {data.events.map((evt) => (
                <div key={evt.step_index} className="relative group">
                  
                  {/* Step Dot */}
                  <div className="absolute -left-[35px] top-1 flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 border border-slate-700">
                    {stageIcons[evt.stage as keyof typeof stageIcons] || <Clock className="w-3 h-3 text-slate-400" />}
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-1.5 hover:border-indigo-500/40 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                        {evt.stage.replace(/_/g, " ")}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] px-2 py-0.5 bg-slate-900 text-slate-400 border border-slate-800 rounded-md font-mono">
                          {evt.actor}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">{evt.timestamp}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-200">{evt.description}</p>
                    
                    {/* State Delta Box */}
                    {Object.keys(evt.state_delta).length > 0 && (
                      <div className="mt-2 p-2 rounded-lg bg-slate-900/90 border border-slate-850 font-mono text-[10px] text-slate-400">
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
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400 flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Immutable Audit Trail Chained via SQLite Ledger</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-all cursor-pointer"
          >
            Close Timeline
          </button>
        </div>

      </div>
    </div>
  );
}
