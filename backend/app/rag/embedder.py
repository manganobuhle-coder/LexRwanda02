import os
import hashlib
from typing import List


class LegalEmbedder:
    """
    Embedding service. Supports multiple backends:
    - Voyage AI voyage-law-2 (tuned for legal text)
    - OpenAI text-embedding-3-small
    - sentence-transformers (local, free, no rate limits)
    - Mock embeddings for testing (deterministic, no API calls)
    """

    def __init__(self, model: str = "voyage-law-2", api_key: str = None, use_mock: bool = False):
        if use_mock:
            self._backend = "mock"
            self._model = "mock-embedding"
            return

        from app.config import settings
        if settings.USE_LOCAL_EMBEDDINGS:
            from fastembed import TextEmbedding
            print(f"Loading local embedding model: {settings.LOCAL_EMBEDDING_MODEL}")
            self._client = TextEmbedding(model_name=settings.LOCAL_EMBEDDING_MODEL)
            self._model = settings.LOCAL_EMBEDDING_MODEL
            self._backend = "local"
            return

        voyage_key = api_key or os.getenv("VOYAGE_API_KEY")

        if voyage_key:
            import voyageai
            self._client = voyageai.Client(api_key=voyage_key)
            self._model = model
            self._backend = "voyage"
        else:
            from openai import OpenAI
            self._client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            self._model = "text-embedding-3-small"
            self._backend = "openai"

    def _generate_mock_embedding(self, text: str, dim: int = 1024) -> List[float]:
        """Generate deterministic mock embeddings using hash."""
        hash_obj = hashlib.sha256(text.encode())
        hash_bytes = hash_obj.digest()
        
        embedding = []
        for i in range(dim):
            byte_idx = i % len(hash_bytes)
            value = (ord(hash_bytes[byte_idx:byte_idx+1]) - 128) / 128.0
            embedding.append(value)
        return embedding

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        if self._backend == "mock":
            return [self._generate_mock_embedding(text) for text in texts]
        if self._backend == "local":
            return [[float(x) for x in v] for v in self._client.embed(texts)]
        if self._backend == "voyage":
            result = self._client.embed(texts, model=self._model, input_type="document")
            return result.embeddings
        response = self._client.embeddings.create(input=texts, model=self._model)
        return [item.embedding for item in response.data]

    def embed_query(self, query: str) -> List[float]:
        if self._backend == "mock":
            return self._generate_mock_embedding(query)
        if self._backend == "local":
            return [float(x) for x in list(self._client.embed([query]))[0]]
        if self._backend == "voyage":
            result = self._client.embed([query], model=self._model, input_type="query")
            return result.embeddings[0]
        response = self._client.embeddings.create(input=[query], model=self._model)
        return response.data[0].embedding

    @property
    def backend(self) -> str:
        return self._backend
