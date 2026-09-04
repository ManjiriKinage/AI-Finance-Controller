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
        "Hello! I am your **AI Finance Controller Copilot**. I have live access to verified reconciliation ledgers, Razorpay settlements, and bank statements.\n\nHow can I assist your financial operations today?",
      confidence: 99.0,
      suggestedActions: [
        "Why is today's settlement short by ₹18,500?",
        "Show high priority exceptions",
        "What is our projected cash position next week?",
        "Explain settlement SETL_0042 variance"
      ]
    }
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);

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
          content: "Sorry, I encountered an error querying the financial ledger. Please try again.",
          confidence: 0
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col justify-between space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-500 text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white">AI Finance Controller Copilot</h1>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                  SQL Tools Connected
                </span>
              </div>
              <p className="text-xs text-slate-400">Structured reasoning over verified payments, settlements & bank transactions</p>
            </div>
          </div>
        </div>

        {/* Chat History Box */}
        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="p-2 rounded-xl bg-indigo-950/80 border border-indigo-700/50 text-indigo-400 flex-shrink-0 mt-1">
                  <Bot className="w-5 h-5" />
                </div>
              )}

              <div
                className={`p-4 rounded-2xl max-w-2xl text-xs sm:text-sm space-y-3 leading-relaxed shadow-lg ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white ml-12 rounded-tr-xs"
                    : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-xs"
                }`}
              >
                <div className="whitespace-pre-line">{msg.content}</div>

                {/* Sources & Confidence for Assistant */}
                {msg.role === "assistant" && (msg.sources || msg.confidence) && (
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                    {msg.sources && (
                      <div className="flex items-center space-x-1">
                        <span className="font-semibold text-slate-300">Verified Sources:</span>
                        <span>{msg.sources.join(", ")}</span>
                      </div>
                    )}
                    {msg.confidence && (
                      <span className="font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        {msg.confidence}% Confidence
                      </span>
                    )}
                  </div>
                )}

                {/* Suggested Action Chips */}
                {msg.role === "assistant" && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/60 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300 block">
                      Suggested Quick Prompts:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedActions.map((action, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleSendMessage(action)}
                          className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-800/80 hover:bg-slate-750 text-indigo-300 hover:text-white border border-slate-700/60 transition-all text-left"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex-shrink-0 mt-1">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-indigo-950/80 border border-indigo-700/50 text-indigo-400 flex-shrink-0">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]"></div>
                </div>
                <span>Querying financial ledgers and analyzing evidence...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="relative pt-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
            placeholder="Ask anything (e.g. 'Why is settlement short by ₹18,500?', 'Forecast next week cash')..."
            className="w-full pl-4 pr-12 py-3.5 text-xs sm:text-sm bg-slate-900 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 shadow-xl"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputQuery.trim() || loading}
            className="absolute right-2.5 top-5 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-all shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </main>
    </div>
  );
}
