import os
from supabase import create_client, Client
from typing import Optional
from functools import lru_cache

class SupabaseManager:
    """Supabase 클라이언트 관리 (싱글톤 패턴)"""
    
    def __init__(self) -> None:
        self.url: Optional[str] = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        self.key: Optional[str] = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
        self._client: Optional[Client] = None
        
        if not self.url or not self.key:
            raise ValueError(
                "Supabase URL과 KEY가 환경변수에 설정되지 않았습니다. "
                "NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인하세요."
            )
    
    @property
    def client(self) -> Client:
        """Supabase 클라이언트 반환 (지연 초기화)"""
        if self._client is None:
            if not self.url or not self.key:
                raise ValueError("Supabase 환경변수가 설정되지 않았습니다.")
            self._client = create_client(self.url, self.key)
        return self._client
    
    def test_connection(self) -> bool:
        """DB 연결 테스트"""
        try:
            self.client.table('voices').select("count", count="exact").execute()
            return True
        except Exception:
            return False

# 전역 Supabase 매니저 인스턴스
_supabase_manager: Optional[SupabaseManager] = None

def get_supabase_manager() -> SupabaseManager:
    """Supabase 매니저 인스턴스 반환"""
    global _supabase_manager
    if _supabase_manager is None:
        _supabase_manager = SupabaseManager()
    return _supabase_manager

async def get_supabase() -> Client:
    """FastAPI 의존성 주입용 Supabase 클라이언트"""
    return get_supabase_manager().client

@lru_cache(maxsize=1)
def get_supabase_sync() -> Client:
    """동기 Supabase 클라이언트 (캐시됨)"""
    return get_supabase_manager().client 