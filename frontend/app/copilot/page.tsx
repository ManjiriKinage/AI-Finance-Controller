"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
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
    <div className="min-h-screen bg-[#F5F6F3] flex flex-col lg:flex-row font-sans pb-20 lg:pb-0">
      
      {/* Light Sidebar (Desktop ~1440px fluid) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full lg:max-w-[1180px] xl:max-w-[1240px]">
        
        {/* Mobile Header (< 1024px) */}
        <Navbar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col max-w-4xl w-full mx-auto space-y-4">

          {/* Institutional Header Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#3730A3]">
                  <Sparkles className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="font-heading font-bold text-lg sm:text-xl text-slate-900">
                      Finance Operations Copilot
                    </h1>
                    <span className="px-2.5 py-0.5 text-[10px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md">
                      Core Ledger Connected
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Rule-verified operations copilot grounded on live payments, settlements & bank ledgers
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Chat History Box */}
          <div className="flex-1 space-y-4 overflow-y-auto pr-1 min-h-[400px]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start space-x-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-[#3730A3] shrink-0 mt-1">
                    <Bot className="w-4 h-4 stroke-[1.5]" />
                  </div>
                )}

                <div
                  className={`p-4 rounded-2xl max-w-xl text-xs sm:text-sm space-y-3 leading-relaxed shadow-none ${
                    msg.role === "user"
                      ? "bg-[#3730A3] text-white ml-12 rounded-tr-xs"
                      : "bg-white border border-[#E5E7EB] text-slate-800 rounded-tl-xs"
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.content}</div>

                  {/* Sources & Confidence for Assistant */}
                  {msg.role === "assistant" && (msg.sources || msg.confidence) && (
                    <div className="pt-2 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                      {msg.sources && (
                        <div className="flex items-center space-x-1">
                          <span className="font-medium text-slate-500">Sources:</span>
                          <span className="font-mono text-slate-700">{msg.sources.join(", ")}</span>
                        </div>
                      )}
                      {msg.confidence && (
                        <span className="font-mono font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {msg.confidence}% Verified
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-white shrink-0 mt-1">
                    <User className="w-4 h-4 stroke-[1.5]" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-[#3730A3] shrink-0">
                  <Bot className="w-4 h-4 animate-pulse stroke-[1.5]" />
                </div>
                <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] text-xs text-slate-500 flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#3730A3] animate-bounce"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#3730A3] animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#3730A3] animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                  <span>Executing relational joins across financial tables...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts & Input Bar */}
          <div className="space-y-3 pt-2">

            {/* Prompt Chips */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] font-mono uppercase text-slate-500 mr-1">Quick Inquiries:</span>
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={loading}
                  className="min-h-[32px] px-3 py-1 text-xs font-medium rounded-lg bg-white hover:bg-[#F5F6F3] text-slate-700 hover:text-slate-900 border border-[#E5E7EB] transition-colors cursor-pointer text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="relative flex items-center">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
                placeholder="Ask anything (e.g. 'Why is settlement short by ₹18,500?', 'Forecast next week cash')..."
                className="w-full pl-4 pr-14 min-h-[44px] text-xs sm:text-sm bg-white border border-[#E5E7EB] rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#3730A3]"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputQuery.trim() || loading}
                aria-label="Send Query"
                className="absolute right-1.5 w-10 h-10 flex items-center justify-center rounded-lg bg-[#3730A3] hover:bg-indigo-900 text-white disabled:opacity-40 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4 stroke-[1.5]" />
              </button>
            </div>
          </div>

        </main>
      </div>

    </div>
  );
}
