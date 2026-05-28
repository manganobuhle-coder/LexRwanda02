from pydantic import BaseModel
from typing import Optional, List


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    conversation_history: List[ChatMessage] = []
    explain_simply: bool = False
    category_filter: Optional[str] = None
    language: str = "en"


class SourceCitation(BaseModel):
    document_name: str
    article: str
    excerpt: str
    page: Optional[int] = None
    similarity_score: float


class ChatResponse(BaseModel):
    answer: str
    sources: List[SourceCitation]
    confidence: str  # "high", "medium", "low"
    disclaimer: str = (
        "This is legal information, not legal advice. "
        "For your specific situation, consult a licensed attorney in Rwanda."
    )
