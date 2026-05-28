"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Sparkles, RefreshCw, Scale } from "lucide-react";
import MessageBubble from "./MessageBubble";
import LegalDisclaimer from "./LegalDisclaimer";
import { streamChatMessage, type ChatMessage, type SourceCitation } from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceCitation[];
  confidence?: "high" | "medium" | "low";
}

const STARTER_QUESTIONS = [
  "What are my rights if my employer fires me without notice?",
  "Can a landlord evict a tenant immediately in Rwanda?",
  "What does the Constitution say about freedom of expression?",
  "How do I register a business in Rwanda?",
];

export default function ChatInterface({ initialQuery }: { initialQuery?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(initialQuery || "");
  const [loading, setLoading] = useState(false);
  const [explainSimply, setExplainSimply] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [input]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: text.trim(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      // Placeholder for streaming assistant message
      const assistantId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "", sources: [], confidence: "medium" },
      ]);

      const history: ChatMessage[] = messages
        .concat(userMsg)
        .map((m) => ({ role: m.role, content: m.content }));

      let sources: SourceCitation[] = [];
      let confidence: "high" | "medium" | "low" = "medium";
      let answerText = "";

      try {
        for await (const event of streamChatMessage(text.trim(), history, explainSimply)) {
          if (event.type === "metadata") {
            sources = event.metadata?.sources || [];
            confidence = event.metadata?.confidence || "medium";
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, sources, confidence } : m
              )
            );
          } else if (event.type === "token") {
            answerText += event.content || "";
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: answerText } : m
              )
            );
          }
        }
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content:
                    "Sorry, I encountered an error reaching the legal database. Please try again.",
                }
              : m
          )
        );
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, explainSimply]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const reset = () => {
    setMessages([]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto chat-scroll px-4 py-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 fade-in">
            <div className="w-16 h-16 bg-emerald-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <Scale className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Ask about Rwandan law
            </h2>
            <p className="text-sm text-slate-500 max-w-xs mb-8 leading-relaxed">
              Answers grounded in official legal documents, with source citations.
            </p>
            <div className="grid gap-2 w-full max-w-md">
              {STARTER_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-left text-sm px-4 py-3 border border-slate-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-sm text-slate-600 hover:text-slate-900 transition-all group"
                >
                  <span className="text-emerald-500 mr-2 font-medium group-hover:text-emerald-600">→</span>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={msg.id} className="message-in">
            <MessageBubble
              role={msg.role}
              content={msg.content}
              sources={msg.sources}
              confidence={msg.confidence}
              isStreaming={loading && i === messages.length - 1 && msg.role === "assistant"}
            />
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Disclaimer */}
      <div className="px-4 pb-2">
        <LegalDisclaimer />
      </div>

      {/* Input area */}
      <div className="border-t border-slate-200 bg-white px-4 py-4 space-y-3">
        {/* Options row */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setExplainSimply(!explainSimply)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              explainSimply
                ? "bg-emerald-700 text-white border-emerald-700"
                : "border-slate-300 text-slate-600 hover:border-emerald-400"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            Explain simply
          </button>
          {messages.length > 0 && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors ml-auto"
            >
              <RefreshCw className="w-3 h-3" />
              New conversation
            </button>
          )}
        </div>

        {/* Text input */}
        <div className="flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a legal question… (Shift+Enter for new line)"
            rows={1}
            className="flex-1 resize-none border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-11 h-11 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white rounded-xl flex items-center justify-center shrink-0 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
