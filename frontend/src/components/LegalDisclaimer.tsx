"use client";

import { AlertTriangle } from "lucide-react";

export default function LegalDisclaimer() {
  return (
    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800">
      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-600" />
      <span>
        <strong>Legal information only.</strong> LexRwanda does not provide
        legal advice and is not a substitute for a qualified attorney. Always
        verify information with official sources.
      </span>
    </div>
  );
}
