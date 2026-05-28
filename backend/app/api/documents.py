import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.models.document import DocumentUploadResponse
from app.rag.pipeline import get_pipeline, LexRwandaPipeline
from app.utils.pdf_parser import extract_text_from_pdf

router = APIRouter()

ALLOWED_CATEGORIES = {
    "constitution", "labor", "land", "tax", "business", "contract", "other"
}


@router.post("/documents/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    category: str = "other",
    document_name: str = None,
    source_url: str = None,
    pipeline: LexRwandaPipeline = Depends(get_pipeline),
):
    """
    Upload a PDF legal document.
    The document is parsed, chunked, embedded, and stored in the vector database.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are supported.")

    if category not in ALLOWED_CATEGORIES:
        raise HTTPException(400, f"category must be one of: {sorted(ALLOWED_CATEGORIES)}")

    raw = await file.read()

    try:
        text = extract_text_from_pdf(raw)
    except Exception as exc:
        raise HTTPException(422, f"Could not parse PDF: {exc}")

    if len(text.strip()) < 50:
        raise HTTPException(422, "PDF appears to be empty or image-only (no extractable text).")

    name = document_name or file.filename.removesuffix(".pdf")

    chunks_created = pipeline.ingest_document(
        text=text,
        document_name=name,
        category=category,
        source_url=source_url,
    )

    return DocumentUploadResponse(
        document_id=str(uuid.uuid4()),
        name=name,
        chunks_created=chunks_created,
        status="indexed",
    )


@router.get("/documents/stats")
async def stats(pipeline: LexRwandaPipeline = Depends(get_pipeline)):
    """Return vector store statistics."""
    return pipeline.get_stats()
