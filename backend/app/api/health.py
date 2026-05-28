from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health():
    try:
        from app.rag.pipeline import get_pipeline
        stats = get_pipeline().get_stats()
        return {"status": "healthy", "vector_store": stats, "service": "LexRwanda API v1"}
    except Exception as exc:
        return {"status": "degraded", "error": str(exc)}
