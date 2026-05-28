from typing import List, Optional

from app.rag.chunker import LegalDocumentChunker
from app.rag.embedder import LegalEmbedder
from app.rag.retriever import LegalRetriever
from app.rag.generator import LegalGenerator
from app.models.chat import ChatMessage, ChatResponse
from app.config import settings


class LexRwandaPipeline:
    """
    Orchestrates the full RAG cycle:
    ingest → retrieve → generate → cite.
    """

    def __init__(self, use_mock: bool = False):
        self.embedder = LegalEmbedder(
            model=settings.EMBEDDING_MODEL,
            api_key=settings.VOYAGE_API_KEY or None,
            use_mock=use_mock,
        )
        self.retriever = LegalRetriever(
            embedder=self.embedder,
            persist_dir=settings.CHROMA_PERSIST_DIR,
            collection_name=settings.COLLECTION_NAME,
        )
        self.generator = LegalGenerator(
            model=settings.CLAUDE_MODEL,
            api_key=settings.ANTHROPIC_API_KEY,
        )
        self.chunker = LegalDocumentChunker(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP,
        )

    # -------------------------------------------------------------------- chat

    async def chat(
        self,
        query: str,
        history: List[ChatMessage],
        explain_simply: bool = False,
        category_filter: Optional[str] = None,
    ) -> ChatResponse:
        chunks = self.retriever.retrieve(
            query=query,
            top_k=settings.TOP_K_RETRIEVAL,
            category_filter=category_filter,
            min_similarity=settings.MIN_SIMILARITY_THRESHOLD,
        )

        confidence = self.generator.determine_confidence(chunks)

        answer = self.generator.generate(
            query=query,
            chunks=chunks,
            history=history,
            explain_simply=explain_simply,
        )

        sources = self.retriever.to_source_citations(chunks)

        return ChatResponse(answer=answer, sources=sources, confidence=confidence)

    # ------------------------------------------------------------------ ingest

    def ingest_document(
        self,
        text: str,
        document_name: str,
        category: str,
        language: str = "en",
        source_url: str = None,
        document_date: str = None,
    ) -> int:
        chunks = self.chunker.chunk_document(
            text=text,
            document_name=document_name,
            category=category,
            language=language,
            source_url=source_url,
            document_date=document_date,
        )
        self.retriever.add_chunks(chunks)
        return len(chunks)

    def get_stats(self):
        return self.retriever.get_stats()


# ---------------------------------------------------------------- singleton

_pipeline: LexRwandaPipeline | None = None


def get_pipeline(use_mock: bool = False) -> LexRwandaPipeline:
    global _pipeline
    if _pipeline is None:
        _pipeline = LexRwandaPipeline(use_mock=use_mock)
    return _pipeline
