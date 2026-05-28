from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import chat, documents, health

app = FastAPI(
    title="LexRwanda API",
    description="RAG-powered legal information assistant for Rwanda",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://lexrwanda.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(documents.router, prefix="/api", tags=["documents"])


@app.get("/")
async def root():
    return {
        "service": "LexRwanda API",
        "tagline": "Know your rights. In your language. Instantly.",
        "docs": "/docs",
    }
