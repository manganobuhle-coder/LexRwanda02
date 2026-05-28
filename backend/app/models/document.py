from pydantic import BaseModel
from typing import Optional


class DocumentUploadResponse(BaseModel):
    document_id: str
    name: str
    chunks_created: int
    status: str


class CollectionStats(BaseModel):
    total_chunks: int
    collection_name: str
