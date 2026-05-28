# LexRwanda

> **Know your rights. In your language. Instantly.**

LexRwanda is an AI-powered legal information assistant that helps Rwandan citizens understand their rights — without needing a lawyer. Ask any question about Rwandan law in plain language and receive a grounded, cited answer sourced directly from official legal documents.

**Hackathon Track:** Governance & Collaboration  
**Built for:** ALU Claude Builder Club Hackathon · Kigali, May 2026  
**Live Demo:** https://lexrwanda.vercel.app

---

## The Problem

Rwanda has made remarkable progress in codifying its laws — but access to legal understanding remains deeply unequal. Official statutes are written in dense legal language, often across three languages (Kinyarwanda, English, French), and indexed in ways that require legal training to navigate.

The practical consequence: most Rwandan citizens cannot answer basic questions about their own rights.

- **Can my landlord evict me without notice?**
- **Am I entitled to severance pay if I'm fired?**
- **What does the Constitution say about my right to own land?**

Hiring a lawyer to answer these questions costs money most citizens don't have. The alternative — searching government PDFs — is slow, inaccessible, and incomprehensible to the legally untrained.

This is not a problem of information scarcity. Rwanda's laws are public. It is a problem of **access**.

---

## The Solution

LexRwanda bridges the gap between the letter of the law and the citizen who needs to understand it.

It is a **Retrieval-Augmented Generation (RAG)** system built on three pillars:

1. **Indexed legal corpus** — five key Rwandan legal documents are parsed, chunked by article/section, and stored as semantic vectors in a local ChromaDB vector store.

2. **Semantic search** — when a citizen asks a question, LexRwanda finds the most relevant legal provisions using cosine similarity over the embedding space.

3. **Grounded generation** — Claude reads only those retrieved provisions and generates a plain-language answer, citing the exact article and document it draws from.

The system never guesses. If the evidence is weak, it says so. If a question falls outside its corpus, it tells you to consult a lawyer.

---

## How Claude Is Used

Claude (claude-sonnet-4-6) is the reasoning and generation engine at the core of LexRwanda.

### What Claude does

| Task | How |
|------|-----|
| **Answer generation** | Given retrieved legal chunks, Claude synthesizes a clear, accurate explanation grounded only in the provided text |
| **Streaming responses** | Answers stream token-by-token via SSE for fast perceived response and live text rendering |
| **Plain language mode** | "Explain Simply" prompts Claude to rewrite answers without legal jargon for accessibility |
| **Honest uncertainty** | Claude is instructed to acknowledge low-confidence retrievals and recommend professional legal advice |
| **Conversation memory** | Multi-turn chat history is passed so Claude can answer follow-up questions in context |

### What Claude does NOT do

Claude does not retrieve documents, perform similarity search, or hallucinate legal content. It only generates answers from text that the retrieval layer has already confirmed is relevant and high-similarity. This architecture ensures **every factual claim is traceable to a real legal source**.

### System Prompt Design

The system prompt instructs Claude to:
- Act as a knowledgeable legal assistant, not a practicing lawyer
- Ground every answer in the retrieved excerpts
- Always cite the document name and article/section
- Use a confidence level (HIGH / MEDIUM / LOW) based on retrieval quality
- Acknowledge when it lacks sufficient evidence rather than speculating

---

## Impact

LexRwanda targets a concrete access gap. Its direct users are:

- **Workers** seeking to understand employment rights (termination, severance, leave)
- **Tenants and landowners** navigating land tenure and rental law
- **Entrepreneurs** understanding business registration requirements
- **Citizens** exercising constitutional rights (expression, assembly, property)

**Why it matters in the Rwandan context:**  
Rwanda's legal system is well-developed and publicly documented — but legal literacy has not kept pace. LexRwanda doesn't replace lawyers; it empowers citizens to have *informed* conversations, know when their rights are being violated, and access the system with confidence.

The model is extensible: the same architecture could index laws for any African jurisdiction, making LexRwanda a template for continent-wide legal access.

---

## Technical Architecture

```
User (browser)
    │
    ▼
Next.js Frontend (Vercel)
    │  POST /api/chat/stream  (SSE)
    ▼
FastAPI Backend (Render)
    │
    ├─ Retrieval Layer
    │     pdfplumber → LegalDocumentChunker → fastembed → ChromaDB
    │     (BAAI/bge-small-en-v1.5 local embeddings, no API call at query time)
    │
    └─ Generation Layer
          Top-K chunks → System prompt → Claude claude-sonnet-4-6 (streaming)
```

### Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, Tailwind CSS, react-markdown |
| Backend | FastAPI, Python 3.11+ |
| Vector Store | ChromaDB (persistent, cosine similarity) |
| Embeddings | fastembed + BAAI/bge-small-en-v1.5 (local ONNX, free, no rate limits) |
| Generation | Anthropic Claude claude-sonnet-4-6 via streaming SSE |
| PDF Parsing | pdfplumber with multi-column gazette layout support |

### RAG Pipeline Detail

| Stage | Component | Notes |
|-------|-----------|-------|
| **Parsing** | pdfplumber | Handles A4 landscape gazette PDFs (Kinyarwanda \| English \| French columns); crops to English column |
| **Chunking** | LegalDocumentChunker | Article/section-aware splitting, 500-token chunks, 100-token overlap |
| **Embedding** | fastembed (local) | 384-dim vectors, ONNX inference, no API dependency |
| **Indexing** | ChromaDB | Persistent on disk, cosine distance |
| **Retrieval** | Semantic search | Top-5 chunks, ≥0.55 similarity threshold |
| **Confidence** | Score-based | HIGH ≥0.75 avg · MEDIUM ≥0.60 · LOW below |
| **Generation** | Claude claude-sonnet-4-6 | Streaming, grounded, cites sources |

---

## Legal Document Corpus

| Document | Category | Provisions |
|----------|----------|-----------|
| Constitution of Rwanda (Revised 2015) | Constitutional rights | ~200 articles |
| Labour Code — Law No. 66/2018 | Employment law | Worker & employer rights |
| Rwanda Land Law (2021) | Land tenure | Ownership, leasing, expropriation |
| Law Governing the Office of Notary (Amended) | Civil procedure | Notarial acts |
| Law No. 017/2023 — Governing the Notary | Civil procedure | 2023 amendments |

---

## Features

- **Streaming chat** — SSE-based, renders as Claude types
- **Source citations** — expandable per-source cards with article name, similarity score, and verbatim excerpt
- **Confidence badges** — HIGH / MEDIUM / LOW with colour coding
- **"Explain Simply" mode** — plain-language rewrites on demand
- **Document upload** — index any PDF on the fly via the sidebar
- **Copy button** — one-click answer copying
- **Multi-turn conversation** — follow-up questions maintain context
- **Honest uncertainty** — low-confidence answers recommend consulting a lawyer
- **Legal disclaimer** — persistent, non-dismissable

---

## Local Development

### Prerequisites

- Python 3.11+
- Node.js 18+
- An Anthropic API key

### Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and set: ANTHROPIC_API_KEY=your_key_here

# (Optional) Re-ingest documents from scratch
# rm -rf data/chroma && python scripts/ingest.py

# Start the API server
uvicorn app.main:app --reload
# API docs: http://localhost:8000/docs
```

### Frontend

```bash
cd frontend

npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local and set: NEXT_PUBLIC_API_URL=http://localhost:8000

npm run dev
# App: http://localhost:3000
```

---

## Deployment

See **[DEPLOY.md](DEPLOY.md)** for full Render + Vercel deployment instructions.

Quick summary:
- **Backend** → Render (free web service, Python)
- **Frontend** → Vercel (free, Next.js)

---

## Project Structure

```
LexRwanda/
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI route handlers (chat, documents, health)
│   │   ├── models/       # Pydantic request/response models
│   │   ├── rag/          # Core RAG pipeline (embedder, retriever, generator, chunker)
│   │   └── utils/        # PDF parser with gazette column detection
│   ├── data/
│   │   ├── chroma/       # Pre-built vector store (committed for deployment)
│   │   └── raw/          # Source PDF files (gitignored)
│   ├── scripts/
│   │   └── ingest.py     # Document ingestion CLI
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── app/          # Next.js App Router pages
    │   ├── components/   # ChatInterface, MessageBubble, SourceCard, etc.
    │   └── lib/          # API client (SSE streaming)
    └── package.json
```

---

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/chat` | Non-streaming chat with full response |
| `POST` | `/api/chat/stream` | Streaming SSE chat (metadata → tokens → done) |
| `POST` | `/api/documents/upload` | Upload & index a PDF in real time |
| `GET` | `/api/documents/stats` | Vector store statistics |
| `GET` | `/api/health` | Health check |

---

## Ethical Alignment

**What we built carefully:**

- **Grounded-only answers** — Claude is architecturally constrained to cited sources; it cannot speculate about legal matters without evidence.
- **Transparent confidence** — every answer shows a confidence level; low-confidence answers explicitly recommend consulting a lawyer.
- **Legal disclaimer** — persistent on every chat page; LexRwanda is information, not advice.
- **No user data stored** — conversations are stateless; nothing is logged or retained server-side.
- **Honest limitations** — the system acknowledges corpus gaps rather than generating plausible-sounding but unreliable answers.

**What we acknowledge:**

- The corpus covers 5 documents. Questions outside these are out of scope.
- AI can make mistakes. Critical legal decisions should always involve a qualified professional.
- The tool is in English only; a Kinyarwanda interface is a meaningful future priority.

---

## License

MIT — built to be forked, extended, and deployed for other jurisdictions.

---

*Built for the ALU Claude Builder Club Hackathon — Kigali, May 2026*  
*Inspired by Dario Amodei's "Machines of Loving Grace"*
