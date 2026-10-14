"use client";

import React, { useEffect, useState } from "react";
import {
  Zap,
  FlaskConical,
  Radio
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
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 stroke-[1.5] text-[#3730A3]" />
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-900">
              Webhook Event Stream
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">gateway.razorpay.com/v1/webhooks</span>
        </div>

        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
          Live Ingestion
        </span>
      </div>

      {/* Scenario Sandbox Trigger */}
      <div className="p-4 rounded-xl bg-[#F5F6F3] border border-[#E5E7EB] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-heading font-bold text-slate-800 flex items-center space-x-1.5">
            <FlaskConical className="w-4 h-4 stroke-[1.5] text-[#3730A3]" />
            <span>Scenario Sandbox</span>
          </span>
          <span className="text-[11px] text-slate-500">Clearing Simulation</span>
        </div>

        <button
          onClick={handleInjectAnomaly}
          disabled={isInjecting}
          className="min-h-[44px] w-full py-2 px-3 text-xs font-semibold rounded-xl bg-white hover:bg-rose-50 text-[#DC2626] border border-rose-200 transition-colors cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-50"
        >
          <Zap className="w-4 h-4 stroke-[1.5] text-[#DC2626]" />
          <span>{isInjecting ? "Injecting Payload..." : "Simulate Settlement Delay (+₹26.4K)"}</span>
        </button>
      </div>

      {/* Quick Event Simulation Controls */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => handleSimulateEvent("payment.captured")}
          disabled={isSimulating}
          className="min-h-[44px] py-2 px-2 text-[11px] font-semibold rounded-xl bg-white hover:bg-[#F5F6F3] text-slate-700 border border-[#E5E7EB] transition-colors cursor-pointer text-center disabled:opacity-50"
        >
          + Payment
        </button>
        <button
          onClick={() => handleSimulateEvent("settlement.processed")}
          disabled={isSimulating}
          className="min-h-[44px] py-2 px-2 text-[11px] font-semibold rounded-xl bg-white hover:bg-[#F5F6F3] text-slate-700 border border-[#E5E7EB] transition-colors cursor-pointer text-center disabled:opacity-50"
        >
          + Settlement
        </button>
        <button
          onClick={() => handleSimulateEvent("refund.created")}
          disabled={isSimulating}
          className="min-h-[44px] py-2 px-2 text-[11px] font-semibold rounded-xl bg-white hover:bg-[#F5F6F3] text-slate-700 border border-[#E5E7EB] transition-colors cursor-pointer text-center disabled:opacity-50"
        >
          + Refund
        </button>
      </div>

      {/* Stream List */}
      <div className="space-y-2 max-h-[290px] overflow-y-auto pr-0.5">
        {events.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Listening for gateway webhook signatures...
          </div>
        ) : (
          events.slice(0, 6).map((ev) => (
            <div
              key={ev.event_id}
              className="p-3 rounded-xl bg-[#F5F6F3] border border-[#E5E7EB] flex items-center justify-between text-xs space-x-2"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${ev.status === "EXCEPTION_FLAGGED"
                      ? "bg-[#DC2626]"
                      : ev.status === "RECONCILED"
                        ? "bg-[#059669]"
                        : "bg-[#3730A3]"
                    }`}
                />
                <div className="truncate">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono text-[11px] font-bold text-slate-900 truncate">
                      {ev.event_type}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{ev.entity_id}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">{ev.narration}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono font-bold text-slate-900 block text-[11px] tabular-nums">
                  ₹{ev.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[9px] text-slate-400 font-mono tabular-nums">{ev.processing_time_ms}ms</span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
