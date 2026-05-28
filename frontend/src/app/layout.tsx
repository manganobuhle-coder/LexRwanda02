import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LexRwanda — Know Your Rights",
  description:
    "AI-powered legal information assistant for Rwanda. Ask questions about Rwandan law in plain language.",
  keywords: ["Rwanda", "legal", "law", "rights", "AI", "chatbot"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased">{children}</body>
    </html>
  );
}
