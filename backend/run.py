#!/usr/bin/env python3
"""
AI Voice Chat FastAPI 서버 실행 스크립트
"""

import uvicorn
import os
from dotenv import load_dotenv

def check_environment() -> None:
    """환경변수 확인 및 출력"""
    print("🚀 AI Voice Chat FastAPI 서버 시작...")
    print("=" * 50)
    
    # 필수 환경변수 확인
    elevenlabs_key = os.getenv("ELEVENLABS_API_KEY")
    supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    
    # ElevenLabs API 키
    if elevenlabs_key:
        print(f"✅ ElevenLabs API Key: {elevenlabs_key[:10]}...")
    else:
        print("⚠️  ELEVENLABS_API_KEY가 설정되지 않았습니다! (Mock 모드로 실행)")
    
    # Supabase 설정
    if supabase_url and supabase_key:
        print(f"✅ Supabase URL: {supabase_url}")
        print(f"✅ Supabase Key: {supabase_key[:20]}...")
    else:
        print("❌ Supabase 환경변수가 설정되지 않았습니다!")
        print("   NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인하세요.")
    
    print("=" * 50)

def main() -> None:
    """메인 실행 함수"""
    # 환경변수 로드
    load_dotenv()
    
    # 환경변수 확인
    check_environment()
    
    # 서버 정보 출력
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    
    print(f"🌟 서버 실행 중... (http://{host}:{port})")
    print(f"📚 API 문서: http://localhost:{port}/docs")
    print(f"🏥 헬스체크: http://localhost:{port}/health")
    print("=" * 50)
    
    # 서버 실행
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    main() 