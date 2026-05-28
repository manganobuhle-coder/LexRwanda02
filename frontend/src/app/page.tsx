import Link from "next/link";
import { Scale, FileSearch, BookOpen, Shield, ArrowRight, CheckCircle, Database, Sparkles } from "lucide-react";

const STATS = [
  { value: "5", label: "Legal Codes" },
  { value: "800+", label: "Provisions Indexed" },
  { value: "100%", label: "Source-Grounded" },
  { value: "Free", label: "For Citizens" },
];

const FEATURES = [
  {
    icon: Scale,
    title: "Ask Legal Questions",
    description:
      "Ask about labor rights, land ownership, contracts, or any Rwandan law — in plain language.",
  },
  {
    icon: FileSearch,
    title: "Cited Sources",
    description:
      "Every answer references the exact legal document and article it came from.",
  },
  {
    icon: BookOpen,
    title: "Plain Language",
    description:
      'Hit "Explain Simply" to get any answer rewritten without legal jargon.',
  },
  {
    icon: Shield,
    title: "Trustworthy AI",
    description:
      "Answers grounded in real Rwandan law. The system says when it doesn't know.",
  },
];

const HOW_IT_WORKS = [
  {
    icon: Sparkles,
    step: "01",
    title: "Ask in plain language",
    description: "Type your legal question exactly as you'd ask a friend — no legal training required.",
  },
  {
    icon: Database,
    step: "02",
    title: "AI searches Rwandan law",
    description: "LexRwanda retrieves the most relevant provisions from our indexed legal corpus.",
  },
  {
    icon: CheckCircle,
    step: "03",
    title: "Get a grounded answer",
    description: "Receive a clear answer with direct citations to the source articles and confidence indicators.",
  },
];

const SAMPLE_QUESTIONS = [
  "What are my rights if my employer fires me without notice?",
  "Can a landlord increase rent without warning in Rwanda?",
  "What does the Constitution say about freedom of expression?",
  "How do I register a business in Rwanda?",
];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-700 rounded-lg flex items-center justify-center">
            <Scale className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl text-slate-900">LexRwanda</span>
        </div>
        <Link
          href="/chat"
          className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all hover:shadow-md"
        >
          Start Asking <ArrowRight className="w-4 h-4" />
        </Link>
      </header>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-24 overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-800">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #10b981 0%, transparent 50%), radial-gradient(circle at 75% 75%, #059669 0%, transparent 50%)`
        }} />

        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 text-emerald-100 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Powered by Claude AI · Grounded in Rwandan Law
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-5 leading-tight tracking-tight">
            Know your rights.{" "}
            <span className="text-emerald-300">In your language.</span>{" "}
            <span className="block mt-1">Instantly.</span>
          </h1>

          <p className="text-lg text-emerald-100 mb-10 max-w-xl mx-auto leading-relaxed">
            LexRwanda helps citizens understand Rwandan laws, contracts, and
            legal documents — without needing a lawyer for every question.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/chat"
              className="flex items-center justify-center gap-2 bg-white hover:bg-emerald-50 text-emerald-900 font-semibold px-7 py-3.5 rounded-xl transition-all text-base shadow-lg hover:shadow-xl"
            >
              Ask a Legal Question <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/chat?mode=upload"
              className="flex items-center justify-center gap-2 border border-white/30 hover:border-white/60 text-white font-semibold px-7 py-3.5 rounded-xl transition-all text-base hover:bg-white/10"
            >
              Upload a Document
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-emerald-700 py-5 px-6">
        <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-emerald-200 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sample questions */}
      <section className="bg-white py-14 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-7">
            People are asking…
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {SAMPLE_QUESTIONS.map((q) => (
              <Link
                key={q}
                href={`/chat?q=${encodeURIComponent(q)}`}
                className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-sm transition-all text-left group"
              >
                <Scale className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-sm text-slate-700 group-hover:text-slate-900 leading-snug">
                  {q}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">
            How it works
          </h2>
          <p className="text-center text-slate-500 text-sm mb-12">Three steps to legal clarity</p>
          <div className="grid sm:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ icon: Icon, step, title, description }, i) => (
              <div key={step} className="relative flex flex-col items-center text-center">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden sm:block absolute top-6 left-[calc(50%+3rem)] right-[calc(-50%+3rem)] h-px bg-emerald-200 z-0" />
                )}
                <div className="relative z-10 w-12 h-12 bg-emerald-700 rounded-2xl flex items-center justify-center mb-4 shadow-md">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-bold text-emerald-600 mb-1">{step}</span>
                <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">
            Built for trust. Designed for citizens.
          </h2>
          <p className="text-center text-slate-500 text-sm mb-10">Every feature puts accuracy first</p>
          <div className="grid sm:grid-cols-2 gap-5">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group bg-white p-6 rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-emerald-100 rounded-xl group-hover:bg-emerald-700 transition-colors">
                    <Icon className="w-4 h-4 text-emerald-700 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-semibold text-slate-900">{title}</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-emerald-700 py-14 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-3">
            Your legal question deserves an answer.
          </h2>
          <p className="text-emerald-200 text-sm mb-7">
            LexRwanda is free, grounded in official Rwandan law, and available 24/7.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 bg-white hover:bg-emerald-50 text-emerald-900 font-semibold px-7 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl text-base"
          >
            Ask Your Question Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 px-6 py-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-700 rounded flex items-center justify-center">
              <Scale className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-white text-sm">LexRwanda</span>
          </div>
          <p className="text-xs text-slate-500 text-center">
            Provides legal <strong className="text-slate-400">information</strong>, not legal{" "}
            <strong className="text-slate-400">advice</strong>. Always consult a qualified attorney.
          </p>
          <p className="text-xs text-slate-600">
            ALU Claude Builder Club Hackathon · 2025
          </p>
        </div>
      </footer>
    </main>
  );
}
