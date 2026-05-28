"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Scale, FileText, ArrowLeft, CheckCircle } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import DocumentUpload from "@/components/DocumentUpload";

const LEGAL_SOURCES = [
  { name: "Constitution of Rwanda (2003)", articles: "200+ provisions" },
  { name: "Labour Code (Law No. 66/2018)", articles: "Employment rights" },
  { name: "Land Law (Law No. 43/2013)", articles: "Property & tenure" },
  { name: "Tax Procedure Law", articles: "Tax obligations" },
  { name: "Business Registration Law", articles: "Company formation" },
];

function ChatPageContent() {
  const params = useSearchParams();
  const initialQuery = params.get("q") || undefined;

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Top nav */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shadow-sm">
        <Link href="/" className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-emerald-700 rounded-lg flex items-center justify-center">
            <Scale className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-slate-900">LexRwanda</span>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-slate-400">
          <span className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Grounded in Rwandan Law
          </span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (desktop only) */}
        <aside className="hidden lg:flex flex-col w-72 border-r border-slate-200 bg-white overflow-y-auto">
          <div className="p-5 space-y-5">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                Legal Sources
              </p>
              <div className="space-y-2">
                {LEGAL_SOURCES.map((doc) => (
                  <div
                    key={doc.name}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-slate-700 leading-snug">{doc.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{doc.articles}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-slate-100" />

            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                Upload Document
              </p>
              <DocumentUpload />
            </div>

            <hr className="border-slate-100" />

            <div className="space-y-2">
              {[
                "Answers backed by real legal text",
                "Article-level source citations",
                "Confidence indicators on every response",
              ].map((point) => (
                <div key={point} className="flex items-start gap-2 text-xs text-slate-500">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  {point}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main chat */}
        <main className="flex-1 overflow-hidden">
          <ChatInterface initialQuery={initialQuery} />
        </main>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-emerald-700 rounded-xl flex items-center justify-center">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <p className="text-slate-500 text-sm">Loading…</p>
        </div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
}
