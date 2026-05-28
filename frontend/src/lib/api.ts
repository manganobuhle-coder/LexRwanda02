const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface SourceCitation {
  document_name: string;
  article: string;
  excerpt: string;
  similarity_score: number;
  page?: number;
}

export interface ChatResponse {
  answer: string;
  sources: SourceCitation[];
  confidence: "high" | "medium" | "low";
  disclaimer: string;
}

export interface StreamMetadata {
  type: "metadata";
  confidence: "high" | "medium" | "low";
  sources: SourceCitation[];
}

export async function sendChatMessage(
  message: string,
  history: ChatMessage[],
  explainSimply: boolean = false
): Promise<ChatResponse> {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      conversation_history: history,
      explain_simply: explainSimply,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Request failed");
  }

  return res.json();
}

export async function* streamChatMessage(
  message: string,
  history: ChatMessage[],
  explainSimply: boolean = false
): AsyncGenerator<{ type: string; content?: string; metadata?: StreamMetadata }> {
  const res = await fetch(`${API_URL}/api/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      conversation_history: history,
      explain_simply: explainSimply,
    }),
  });

  if (!res.ok || !res.body) throw new Error("Stream failed");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const parsed = JSON.parse(line.slice(6));
          yield parsed;
        } catch {
          // skip malformed lines
        }
      }
    }
  }
}

export async function uploadDocument(
  file: File,
  category: string,
  documentName?: string
): Promise<{ document_id: string; name: string; chunks_created: number; status: string }> {
  const form = new FormData();
  form.append("file", file);
  form.append("category", category);
  if (documentName) form.append("document_name", documentName);

  const res = await fetch(`${API_URL}/api/documents/upload`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Upload failed");
  }

  return res.json();
}

export async function getStats(): Promise<{ total_chunks: number; collection_name: string }> {
  const res = await fetch(`${API_URL}/api/documents/stats`);
  return res.json();
}
