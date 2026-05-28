from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ANTHROPIC_API_KEY: str
    VOYAGE_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    CHROMA_PERSIST_DIR: str = "./data/chroma"
    COLLECTION_NAME: str = "lexrwanda_legal"

    EMBEDDING_MODEL: str = "voyage-law-2"
    CLAUDE_MODEL: str = "claude-sonnet-4-6"
    USE_LOCAL_EMBEDDINGS: bool = False
    LOCAL_EMBEDDING_MODEL: str = "BAAI/bge-small-en-v1.5"

    TOP_K_RETRIEVAL: int = 5
    MIN_SIMILARITY_THRESHOLD: float = 0.60

    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 100

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
