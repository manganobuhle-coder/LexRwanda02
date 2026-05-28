"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, FileText, ExternalLink } from "lucide-react";
import type { SourceCitation } from "@/lib/api";

const CONFIDENCE_STYLES = {
  high: "bg-emerald-100 text-emerald-800 border-emerald-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  low: "bg-red-100 text-red-800 border-red-200",
};

const CONFIDENCE_LABELS = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence — verify with a lawyer",
};

interface SourceCardProps {
  sources: SourceCitation[];
  confidence: "high" | "medium" | "low";
}

export default function SourceCard({ sources, confidence }: SourceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (sources.length === 0) return null;

  return (
    <div className="mt-3 space-y-2 fade-in">
      {/* Confidence badge */}
      <div
        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${CONFIDENCE_STYLES[confidence]}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {CONFIDENCE_LABELS[confidence]}
      </div>

      {/* Sources toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
      >
        <FileText className="w-3.5 h-3.5" />
        {sources.length} source{sources.length !== 1 ? "s" : ""} cited
        {expanded ? (
          <ChevronUp className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
      </button>

      {expanded && (
        <div className="space-y-2 fade-in">
          {sources.map((source, i) => (
            <div
              key={i}
              className="border border-slate-200 rounded-lg overflow-hidden bg-white"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-slate-50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {source.document_name}
                  </p>
                  <p className="text-xs text-slate-500">{source.article}</p>
                </div>
                <div className="flex items-center gap-2 ml-2 shrink-0">
                  <span className="text-xs text-slate-400">
                    {Math.round(source.similarity_score * 100)}% match
                  </span>
                  {openIndex === i ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
              </button>

              {openIndex === i && (
                <div className="px-3 pb-3 fade-in">
                  <div className="bg-slate-50 rounded-md p-3 text-xs text-slate-700 leading-relaxed border-l-2 border-emerald-400 italic">
                    "{source.excerpt}"
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
