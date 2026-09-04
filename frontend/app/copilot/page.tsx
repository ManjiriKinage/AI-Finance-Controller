"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Sparkles, Send, ShieldCheck, HelpCircle, Bot, User, ArrowRight, CornerDownLeft } from "lucide-react";
import { api, CopilotResponse } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  suggestedActions?: string[];
  confidence?: number;
}

export default function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I am your **Finance Copilot**. I have direct relational read access to verified reconciliation ledgers, gateway settlements, and bank statement line-items.\n\nHow can I assist your financial operations today?",
      confidence: 99.0,
      suggestedActions: [
        "Why is today's settlement short by ₹18,500?",
        "Show high exposure exceptions",
        "Forecast 30-day liquidity position",
        "Explain settlement setl_0042 variance"
      ]
    }
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    "Why is today's settlement short by ₹18,500?",
    "Show top critical close blockers",
    "Explain settlement setl_0045 variance",
    "What is our projected cash position next week?"
  ];

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || loading) return;

    // Add user message
    const newMessages: Message[] = [...messages, { role: "user", content: textToSend }];
    setMessages(newMessages);
    setInputQuery("");
    setLoading(true);

    try {
      const resp = await api.askCopilot(textToSend);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: resp.answer,
          sources: resp.sources,
          suggestedActions: resp.suggested_actions,
          confidence: resp.confidence
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Encountered an error querying financial ledgers. Please retry.",
          confidence: 0
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col justify-between space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-semibold text-white">Finance Operations Copilot</h1>
                <span className="px-2 py-0.5 text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                  SQL Tools Connected
                </span>
              </div>
              <p className="text-xs text-slate-400">Deterministic query tool grounded on live payments, settlements & bank ledgers</p>
            </div>
          </div>
        </div>

        {/* Chat History Box */}
        <div className="flex-1 space-y-4 overflow-y-auto pr-1 min-h-[380px]">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-indigo-400 shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-4 rounded-2xl max-w-xl text-xs sm:text-sm space-y-3 leading-relaxed shadow-xs ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white ml-12 rounded-tr-xs"
                    : "bg-slate-900/80 border border-slate-800 text-slate-200 rounded-tl-xs"
                }`}
              >
                <div className="whitespace-pre-line">{msg.content}</div>

                {/* Sources & Confidence for Assistant */}
                {msg.role === "assistant" && (msg.sources || msg.confidence) && (
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                    {msg.sources && (
                      <div className="flex items-center space-x-1">
                        <span className="font-medium text-slate-400">Sources:</span>
                        <span className="font-mono text-slate-300">{msg.sources.join(", ")}</span>
                      </div>
                    )}
                    {msg.confidence && (
                      <span className="font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        {msg.confidence}% Verified
                      </span>
                    )}
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-start space-x-3">
              <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-indigo-400 shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]"></div>
                </div>
                <span>Executing relational joins across financial tables...</span>
              </div>
            </div>
          )}
        </div>

        {/* Anchored Prompt Chips & Input Bar */}
        <div className="space-y-3 pt-2">
          
          {/* Prompt Chips directly above input box */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] font-mono uppercase text-slate-500 mr-1">Quick Inquiries:</span>
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={loading}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer text-left"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
              placeholder="Ask anything (e.g. 'Why is settlement short by ₹18,500?', 'Forecast next week cash')..."
              className="w-full pl-4 pr-12 py-3 text-xs sm:text-sm bg-slate-900/90 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500/80 shadow-xs"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputQuery.trim() || loading}
              className="absolute right-2 top-2 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-all cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
