"""
Ingestion script — parse and index Rwandan legal PDFs into ChromaDB.

Usage:
  cd backend
  python scripts/ingest.py

Drop PDFs into data/raw/ first, then update DOCUMENTS below.
You can also add plain .txt files for quick testing.
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from app.rag.pipeline import get_pipeline
from app.utils.pdf_parser import extract_text_from_pdf

# ------------------------------------------------------------------ registry
# Add your documents here. Files go in backend/data/raw/
DOCUMENTS = [
    {
        "file": "data/raw/constitution.pdf",
        "name": "Constitution of the Republic of Rwanda (Revised 2015)",
        "category": "constitution",
        "source_url": "https://www.parliament.gov.rw/",
        "date": "2015",
    },
    {
        "file": "data/raw/labour_law.pdf",
        "name": "Law Regulating Labour in Rwanda",
        "category": "labor",
        "source_url": "https://www.mifotra.gov.rw/",
        "date": "2018",
    },
    {
        "file": "data/raw/land_law_2021.pdf",
        "name": "Rwanda Land Law (2021)",
        "category": "land",
        "source_url": "https://www.rlma.rw/",
        "date": "2021",
    },
    {
        "file": "data/raw/notary_law.pdf",
        "name": "Law Governing the Office of Notary (Amended)",
        "category": "other",
        "source_url": "https://www.minijust.gov.rw/",
        "date": "2023",
    },
    {
        "file": "data/raw/notary_law_2023.pdf",
        "name": "Law No. 017/2023 of 30/03/2023 Governing the Notary",
        "category": "other",
        "source_url": "https://www.minijust.gov.rw/",
        "date": "2023",
    },
    # Add more documents here as needed
]

# ------------------------------------------------------------------- helpers

def ingest_pdf(pipeline, doc_info: dict) -> int:
    path = doc_info["file"]
    if not os.path.exists(path):
        print(f"  ⚠  Skipping — file not found: {path}")
        return 0

    with open(path, "rb") as f:
        text = extract_text_from_pdf(f.read())

    if len(text.strip()) < 100:
        print(f"  ⚠  Skipping — no extractable text in {path}")
        return 0

    count = pipeline.ingest_document(
        text=text,
        document_name=doc_info["name"],
        category=doc_info["category"],
        source_url=doc_info.get("source_url"),
        document_date=doc_info.get("date"),
    )
    return count


def ingest_txt(pipeline, path: str, name: str, category: str) -> int:
    """Convenience function for plain text files (useful for testing)."""
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()
    return pipeline.ingest_document(
        text=text, document_name=name, category=category
    )


# ---------------------------------------------------------------------- main

def main():
    print("LexRwanda — Document Ingestion\n" + "=" * 40)
    # Use mock embeddings for testing (set to False to use real embeddings)
    USE_MOCK = False
    pipeline = get_pipeline(use_mock=USE_MOCK)
    print(f"Embedder backend: {pipeline.embedder.backend}\n")

    total_chunks = 0
    for doc in DOCUMENTS:
        print(f"\n→ {doc['name']}", flush=True)
        n = ingest_pdf(pipeline, doc)
        if n:
            print(f"  ✓ {n} chunks indexed", flush=True)
        total_chunks += n

    stats = pipeline.get_stats()
    print(f"\n{'=' * 40}")
    print(f"Total chunks in vector store: {stats['total_chunks']}")
    print(f"Chunks added this run       : {total_chunks}")


if __name__ == "__main__":
    main()
