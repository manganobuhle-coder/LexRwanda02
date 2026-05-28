import time
from typing import List, Dict, Any, Optional

import chromadb

from app.rag.embedder import LegalEmbedder
from app.models.chat import SourceCitation


class LegalRetriever:
    """
    Semantic retriever backed by ChromaDB (cosine similarity).
    Each chunk carries its own citation metadata so sources are always traceable.
    """

    def __init__(
        self,
        embedder: LegalEmbedder,
        persist_dir: str = "./data/chroma",
        collection_name: str = "lexrwanda_legal",
    ):
        self.embedder = embedder
        self._chroma = chromadb.PersistentClient(path=persist_dir)
        self.collection = self._chroma.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"},
        )

    # ------------------------------------------------------------------ ingest

    def add_chunks(self, chunks, ids: List[str] = None):
        texts = [c.text for c in chunks]
        metas = [c.metadata for c in chunks]

        if not ids:
            ids = [
                f"chunk_{i}_{abs(hash(c.text)) % 10 ** 9}"
                for i, c in enumerate(chunks)
            ]

        # For API backends, batch small and sleep to respect rate limits (3 RPM free tier).
        # For local backends, send all at once — no rate limit applies.
        if self.embedder.backend == "local":
            batch_size = 100
            all_embeddings = []
            batch_list = list(range(0, len(texts), batch_size))
            for idx, i in enumerate(batch_list):
                print(f"    batch {idx+1}/{len(batch_list)} ({min(i+batch_size, len(texts))}/{len(texts)} chunks)...", flush=True)
                all_embeddings.extend(self.embedder.embed_documents(texts[i : i + batch_size]))
        else:
            batch_size = 20
            all_embeddings = []
            batch_list = list(range(0, len(texts), batch_size))
            for idx, i in enumerate(batch_list):
                print(f"    embedding batch {idx+1}/{len(batch_list)} ({i+1}-{min(i+batch_size, len(texts))}/{len(texts)})...", flush=True)
                all_embeddings.extend(self.embedder.embed_documents(texts[i : i + batch_size]))
                if idx < len(batch_list) - 1:
                    time.sleep(21)  # stay under 3 RPM

        self.collection.add(
            ids=ids,
            documents=texts,
            embeddings=all_embeddings,
            metadatas=metas,
        )

    # ----------------------------------------------------------------- retrieve

    def retrieve(
        self,
        query: str,
        top_k: int = 5,
        category_filter: Optional[str] = None,
        min_similarity: float = 0.40,
    ) -> List[Dict[str, Any]]:
        query_embedding = self.embedder.embed_query(query)

        where = {"category": category_filter} if category_filter else None

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=min(top_k, max(self.collection.count(), 1)),
            where=where,
            include=["documents", "metadatas", "distances"],
        )

        chunks = []
        for doc, meta, dist in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0],
        ):
            similarity = 1.0 - dist  # cosine distance → similarity
            if similarity >= min_similarity:
                chunks.append({"text": doc, "metadata": meta, "similarity": similarity})

        return sorted(chunks, key=lambda x: x["similarity"], reverse=True)

    def to_source_citations(self, chunks: List[Dict]) -> List[SourceCitation]:
        citations = []
        for chunk in chunks:
            meta = chunk["metadata"]
            excerpt = chunk["text"]
            if len(excerpt) > 350:
                excerpt = excerpt[:350] + "…"
            citations.append(
                SourceCitation(
                    document_name=meta.get("document_name", "Unknown Document"),
                    article=meta.get("section_header", "Unknown Section"),
                    excerpt=excerpt,
                    similarity_score=round(chunk["similarity"], 3),
                )
            )
        return citations

    def get_stats(self) -> Dict[str, Any]:
        return {
            "total_chunks": self.collection.count(),
            "collection_name": self.collection.name,
        }
