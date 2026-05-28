"use client";

import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle, XCircle } from "lucide-react";
import { uploadDocument } from "@/lib/api";

const CATEGORIES = [
  { value: "constitution", label: "Constitution" },
  { value: "labor", label: "Labour Law" },
  { value: "land", label: "Land Law" },
  { value: "tax", label: "Tax Regulation" },
  { value: "business", label: "Business / Registration" },
  { value: "contract", label: "Contract / Agreement" },
  { value: "other", label: "Other" },
];

interface UploadResult {
  name: string;
  chunks_created: number;
  status: string;
}

export default function DocumentUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("other");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are supported.");
      return;
    }
    setFile(f);
    setResult(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const res = await uploadDocument(file, category);
      setResult(res);
      setFile(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <h3 className="font-semibold text-slate-800 flex items-center gap-2">
        <FileText className="w-4 h-4 text-emerald-700" />
        Upload a Legal Document
      </h3>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer.files[0] ?? null);
        }}
        className="border-2 border-dashed border-slate-300 hover:border-emerald-400 rounded-lg p-6 text-center cursor-pointer transition-colors"
      >
        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm text-slate-600">
          {file ? (
            <span className="font-medium text-emerald-700">{file.name}</span>
          ) : (
            <>
              Drag & drop a PDF or{" "}
              <span className="text-emerald-700 font-medium">browse</span>
            </>
          )}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {/* Category selector */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
          Document type
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
      >
        {uploading ? "Indexing document…" : "Upload & Index"}
      </button>

      {/* Status */}
      {result && (
        <div className="flex items-start gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            <strong>{result.name}</strong> indexed successfully.{" "}
            {result.chunks_created} searchable chunks created.
          </span>
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2 text-xs text-red-800 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
