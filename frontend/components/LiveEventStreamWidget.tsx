"use client";

import React, { useEffect, useState } from "react";
import {
  Zap,
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Radio,
  Play
} from "lucide-react";
import { api, LiveWebhookEvent } from "@/lib/api";

interface LiveEventStreamWidgetProps {
  onEventProcessed?: () => void;
}

export function LiveEventStreamWidget({ onEventProcessed }: LiveEventStreamWidgetProps) {
  const [events, setEvents] = useState<LiveWebhookEvent[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isInjecting, setIsInjecting] = useState(false);

  const fetchRecent = async () => {
    try {
      const res = await api.getRecentEvents();
      setEvents(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRecent();
  }, []);

  const handleSimulateEvent = async (type?: string) => {
    try {
      setIsSimulating(true);
      const newEvt = await api.simulateIncomingEvent(type);
      setEvents((prev) => [newEvt, ...prev.slice(0, 15)]);
      if (onEventProcessed) onEventProcessed();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleInjectAnomaly = async () => {
    try {
      setIsInjecting(true);
      await api.injectAnomaly(26400.0);
      await fetchRecent();
      if (onEventProcessed) onEventProcessed();
    } catch (err) {
      console.error(err);
    } finally {
      setIsInjecting(false);
    }
  };

  const eventBadges = {
    "payment.captured": "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    "settlement.processed": "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    "refund.created": "bg-rose-500/10 text-rose-400 border-rose-500/30"
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Live Razorpay Event Stream</h3>
            <p className="text-[11px] text-slate-400">Reactive webhook receiver & real-time reconciler</p>
          </div>
        </div>

        {/* 1-Click Trigger Buttons */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => handleSimulateEvent("payment.captured")}
            disabled={isSimulating}
            className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/40 transition-all cursor-pointer disabled:opacity-50"
          >
            + Payment
          </button>
          <button
            onClick={() => handleSimulateEvent("settlement.processed")}
            disabled={isSimulating}
            className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/40 transition-all cursor-pointer disabled:opacity-50"
          >
            + Settlement
          </button>
          <button
            onClick={() => handleSimulateEvent("refund.created")}
            disabled={isSimulating}
            className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/40 transition-all cursor-pointer disabled:opacity-50"
          >
            + Refund
          </button>
        </div>
      </div>

      {/* Live Demo Anomaly Injection Strip */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-900 border border-amber-500/30 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-[11px] font-bold text-slate-200">Demo Injection:</span>
          <span className="text-[11px] text-slate-400">Inject ₹26.4K delayed settlement to watch system react live</span>
        </div>
        <button
          onClick={handleInjectAnomaly}
          disabled={isInjecting}
          className="px-3 py-1 text-[10px] font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 shadow transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-1"
        >
          <Play className="w-3 h-3" />
          <span>{isInjecting ? "Injecting..." : "⚡ Inject Delay"}</span>
        </button>
      </div>

      {/* Event Stream Ticker List */}
      <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
        {events.map((evt) => (
          <div
            key={evt.event_id}
            className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-all"
          >
            <div className="flex items-center space-x-2.5">
              <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded-md border ${eventBadges[evt.event_type] || "bg-slate-800 text-slate-300"}`}>
                {evt.event_type}
              </span>
              <div>
                <p className="font-medium text-slate-200 line-clamp-1">{evt.narration}</p>
                <span className="text-[10px] text-slate-500">{evt.timestamp} • {evt.processing_time_ms}ms</span>
              </div>
            </div>

            <div className="text-right flex-shrink-0 ml-2">
              <span className={`font-bold ${evt.cash_impact >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {evt.cash_impact >= 0 ? "+" : ""}₹{Math.abs(evt.cash_impact).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
