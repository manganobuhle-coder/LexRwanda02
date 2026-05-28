import io
from typing import Dict, Any

import pdfplumber


def _extract_page_text(page) -> str:
    """
    Extract English text from a page, handling multi-column gazette layouts.
    Landscape pages (width > height) are assumed to be tri-lingual gazette format
    (Kinyarwanda | English | French). We crop to the English middle column only.
    Portrait pages are extracted normally.
    """
    if page.width > page.height:
        # Tri-column landscape gazette: English is the middle column (~33%–64% of width)
        english_col = page.crop((
            page.width * 0.33,
            0,
            page.width * 0.64,
            page.height,
        ))
        return english_col.extract_text(x_tolerance=3, y_tolerance=3) or ""
    return page.extract_text(x_tolerance=3, y_tolerance=3) or ""


def extract_text_from_pdf(content: bytes) -> str:
    """
    Extract clean text from a PDF byte stream.
    Uses pdfplumber which handles complex layouts better than PyPDF2.
    """
    pages = []
    with pdfplumber.open(io.BytesIO(content)) as pdf:
        for page in pdf.pages:
            text = _extract_page_text(page)
            if text:
                pages.append(text)
    return "\n\n".join(pages)


def extract_text_with_metadata(content: bytes) -> Dict[str, Any]:
    """Return both extracted text and PDF document metadata."""
    pages = []
    metadata = {}
    with pdfplumber.open(io.BytesIO(content)) as pdf:
        if pdf.metadata:
            metadata = {
                "title": pdf.metadata.get("Title", ""),
                "author": pdf.metadata.get("Author", ""),
                "creation_date": pdf.metadata.get("CreationDate", ""),
                "pages": len(pdf.pages),
            }
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                pages.append(text)

    return {"text": "\n\n".join(pages), "metadata": metadata}
