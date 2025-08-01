from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
import os
from dotenv import load_dotenv
load_dotenv()

from app.routers import voices, conversations
from app.database.supabase import get_supabase

def create_app() -> FastAPI:
    """FastAPI 앱 생성 및 설정"""
    app = FastAPI(
        title="AI Voice Chat API",
        description="ElevenLabs 음성 대화 API",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc"
    )

    # CORS 설정
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000", 
            "http://127.0.0.1:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3001"
        ],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["*"],
    )

    # Gzip 압축
    app.add_middleware(GZipMiddleware, minimum_size=1000)

    # 라우터 등록
    app.include_router(voices.router, prefix="/api/voices", tags=["voices"])
    app.include_router(conversations.router, prefix="/api/conversations", tags=["conversations"])

    return app

app = create_app()

@app.get("/")
async def root():
    """API 루트"""
    return {
        "name": "AI Voice Chat API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """헬스체크"""
    try:
        supabase = await get_supabase()
        result = supabase.table('voices').select("count", count="exact").execute()
        
        return {
            "status": "healthy",
            "database": "connected",
            "voices_count": result.count or 0
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 