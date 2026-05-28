import re
from typing import List, Dict, Any
from dataclasses import dataclass, field


@dataclass
class LegalChunk:
    text: str
    metadata: Dict[str, Any] = field(default_factory=dict)


class LegalDocumentChunker:
    """
    Hierarchical chunker that preserves legal document structure.
    Splits at article/section boundaries and injects section headers
    into every chunk so each chunk is self-identifying.
    """

    ARTICLE_PATTERNS = [
        r'(Article\s+\d+[A-Z]?)',
        r'(ARTICLE\s+\d+[A-Z]?)',
        r'(Section\s+\d+(?:\.\d+)*)',
        r'(SECTION\s+\d+(?:\.\d+)*)',
        r'(Part\s+[IVXivx]+)',
        r'(Chapter\s+[IVXivx\d]+)',
    ]
    SPLIT_PATTERN = re.compile(
        '|'.join(ARTICLE_PATTERNS), flags=re.IGNORECASE
    )

    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 100):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk_document(
        self,
        text: str,
        document_name: str,
        category: str,
        language: str = "en",
        source_url: str = None,
        document_date: str = None,
    ) -> List[LegalChunk]:
        base_meta = {
            "document_name": document_name,
            "category": category,
            "language": language,
            "source_url": source_url or "",
            "document_date": document_date or "",
        }

        sections = self._split_by_structure(text)

        chunks: List[LegalChunk] = []
        for i, (header, content) in enumerate(sections):
            for j, chunk_text in enumerate(self._split_section(header, content)):
                chunks.append(LegalChunk(
                    text=chunk_text,
                    metadata={
                        **base_meta,
                        "section_header": header or f"Section {i + 1}",
                        "chunk_index": f"{i}_{j}",
                    },
                ))

        return chunks

    def _split_by_structure(self, text: str) -> List[tuple]:
        parts = self.SPLIT_PATTERN.split(text)

        if len(parts) <= 1:
            return [("", text.strip())]

        # parts = [preamble, header1, body1, header2, body2, ...]
        # Note: regex split with capturing groups can produce None values
        preamble = (parts[0] or "").strip()
        result = []
        if preamble:
            result.append(("Preamble", preamble))

        i = 1
        while i < len(parts):
            header = (parts[i] or "").strip()
            body_part = parts[i + 1] if i + 1 < len(parts) else None
            body = (body_part or "").strip() if body_part is not None else ""
            if body:
                result.append((header, body))
            i += 2

        return result if result else [("", text.strip())]

    def _split_section(self, header: str, content: str) -> List[str]:
        words = content.split()
        prefix = f"[{header}]\n" if header else ""

        if len(words) <= self.chunk_size:
            return [prefix + content]

        chunks = []
        start = 0
        while start < len(words):
            end = min(start + self.chunk_size, len(words))
            chunk_text = prefix + " ".join(words[start:end])
            chunks.append(chunk_text)
            if end >= len(words):
                break
            start = end - self.chunk_overlap

        return chunks
