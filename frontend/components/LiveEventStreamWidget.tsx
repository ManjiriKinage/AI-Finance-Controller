"use client";

import React, { useEffect, useState } from "react";
import {
  Activity,
  Zap,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Radio,
  RefreshCw,
  PlusCircle,
  FlaskConical
} from "lucide-react";
import { api, LiveWebhookEvent } from "@/lib/api";

interface LiveEventStreamWidgetProps {
  onEventProcessed?: () => void;
}

export function LiveEventStreamWidget({ onEventProcessed }: LiveEventStreamWidgetProps) {
  const [events, setEvents] = useState<LiveWebhookEvent[]>([]);
  const [isInjecting, setIsInjecting] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchRecent = async () => {
    try {
      const data = await api.getRecentEvents();
      setEvents(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRecent();
    const interval = setInterval(fetchRecent, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateEvent = async (type?: string) => {
    try {
      setIsSimulating(true);
      const ev = await api.simulateIncomingEvent(type);
      setEvents((prev) => [ev, ...prev.slice(0, 14)]);
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

  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 shadow-xs flex flex-col space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Webhook Event Stream
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">gateway.razorpay.com/v1/webhooks</span>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/60">
          Live Ingestion
        </span>
      </div>

      {/* Scenario Sandbox Trigger */}
      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/90 flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-300 flex items-center space-x-1.5">
            <FlaskConical className="w-3.5 h-3.5 text-indigo-400" />
            <span>Scenario Sandbox</span>
          </span>
          <span className="text-[10px] text-slate-500">Adversarial Mock</span>
        </div>

        <button
          onClick={handleInjectAnomaly}
          disabled={isInjecting}
          className="w-full py-2 px-3 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-800 text-rose-300 border border-rose-500/30 hover:border-rose-500/50 transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <Zap className="w-3.5 h-3.5 text-rose-400" />
          <span>{isInjecting ? "Injecting Payload..." : "Simulate Settlement Delay (+₹26.4K)"}</span>
        </button>
      </div>

      {/* Quick Event Simulation Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleSimulateEvent("payment.captured")}
          disabled={isSimulating}
          className="flex-1 py-1.5 px-2 text-[10px] font-medium rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-300 border border-slate-700/50 transition-all cursor-pointer text-center disabled:opacity-50"
        >
          + Payment Event
        </button>
        <button
          onClick={() => handleSimulateEvent("settlement.processed")}
          disabled={isSimulating}
          className="flex-1 py-1.5 px-2 text-[10px] font-medium rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-300 border border-slate-700/50 transition-all cursor-pointer text-center disabled:opacity-50"
        >
          + Settlement Batch
        </button>
        <button
          onClick={() => handleSimulateEvent("refund.created")}
          disabled={isSimulating}
          className="flex-1 py-1.5 px-2 text-[10px] font-medium rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-300 border border-slate-700/50 transition-all cursor-pointer text-center disabled:opacity-50"
        >
          + Refund Debit
        </button>
      </div>

      {/* Stream List */}
      <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
        {events.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            Listening for gateway webhook signatures...
          </div>
        ) : (
          events.slice(0, 7).map((ev) => (
            <div
              key={ev.event_id}
              className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between text-xs space-x-2"
            >
              <div className="flex items-center space-x-2 min-w-0">
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    ev.status === "EXCEPTION_FLAGGED"
                      ? "bg-rose-400"
                      : ev.status === "RECONCILED"
                      ? "bg-emerald-400"
                      : "bg-indigo-400"
                  }`}
                />
                <div className="truncate">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono text-[11px] font-medium text-slate-200 truncate">
                      {ev.event_type}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{ev.entity_id}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">{ev.narration}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono font-medium text-slate-200 block text-[11px]">
                  ₹{ev.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">{ev.processing_time_ms}ms</span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
