import json

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from app.models.chat import ChatRequest, ChatResponse
from app.rag.pipeline import get_pipeline, LexRwandaPipeline

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    pipeline: LexRwandaPipeline = Depends(get_pipeline),
):
    """Ask a legal question. Returns a grounded answer with source citations."""
    return await pipeline.chat(
        query=request.message,
        history=request.conversation_history,
        explain_simply=request.explain_simply,
        category_filter=request.category_filter,
    )


@router.post("/chat/stream")
async def chat_stream(
    request: ChatRequest,
    pipeline: LexRwandaPipeline = Depends(get_pipeline),
):
    """Streaming version — emits SSE events: metadata, token, done."""
    chunks = pipeline.retriever.retrieve(
        query=request.message,
        top_k=5,
        category_filter=request.category_filter,
        min_similarity=0.55,
    )
    confidence = pipeline.generator.determine_confidence(chunks)
    sources = pipeline.retriever.to_source_citations(chunks)

    async def event_stream():
        # First: send citations and confidence before any text
        meta = {
            "type": "metadata",
            "confidence": confidence,
            "sources": [s.model_dump() for s in sources],
        }
        yield f"data: {json.dumps(meta)}\n\n"

        # Then: stream the answer token by token
        async for token in pipeline.generator.generate_stream(
            query=request.message,
            chunks=chunks,
            history=request.conversation_history,
            explain_simply=request.explain_simply,
        ):
            yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"

        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
