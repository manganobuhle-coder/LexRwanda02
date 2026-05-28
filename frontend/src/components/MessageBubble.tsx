"use client";

import { useState } from "react";
import { Scale, User, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SourceCard from "./SourceCard";
import type { SourceCitation } from "@/lib/api";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  sources?: SourceCitation[];
  confidence?: "high" | "medium" | "low";
  isStreaming?: boolean;
}

export default function MessageBubble({
  role,
  content,
  sources = [],
  confidence = "medium",
  isStreaming = false,
}: MessageBubbleProps) {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-sm ${
          isUser ? "bg-slate-200" : "bg-emerald-700"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-slate-600" />
        ) : (
          <Scale className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Bubble + controls */}
      <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-emerald-700 text-white rounded-tr-sm shadow-sm"
              : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm"
          }`}
        >
          {isUser ? (
            content
          ) : (
            <>
              {content ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h2: ({ children }) => <p className="font-semibold mt-2 mb-1 text-slate-900">{children}</p>,
                    h3: ({ children }) => <p className="font-medium mt-1 text-slate-800">{children}</p>,
                    strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
                    ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-1">{children}</ol>,
                    li: ({ children }) => <li className="ml-2">{children}</li>,
                    p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                    hr: () => <hr className="my-2 border-slate-200" />,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-emerald-500 pl-3 italic text-slate-600 my-1">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
              ) : null}
              {isStreaming && (
                <span className="inline-flex items-end gap-0.5 ml-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:300ms]" />
                </span>
              )}
            </>
          )}
        </div>

        {/* Copy button for assistant messages */}
        {!isUser && !isStreaming && content && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors px-1 py-0.5 rounded"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-600">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Copy
              </>
            )}
          </button>
        )}

        {/* Sources — only shown for assistant messages */}
        {!isUser && !isStreaming && sources.length > 0 && (
          <SourceCard sources={sources} confidence={confidence} />
        )}
      </div>
    </div>
  );
}
