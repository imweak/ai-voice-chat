import os
import logging
from typing import Optional
from elevenlabs.client import ElevenLabs
from app.database.models import SignedUrlResponse

logger = logging.getLogger(__name__)

class ElevenLabsService:
    """ElevenLabs API 서비스"""
    
    def __init__(self) -> None:
        self.api_key: Optional[str] = os.getenv("ELEVENLABS_API_KEY")
        self._client: Optional[ElevenLabs] = None
        
        if not self.api_key:
            logger.warning("ELEVENLABS_API_KEY가 환경변수에 설정되지 않았습니다.")
    
    @property
    def client(self) -> ElevenLabs:
        """ElevenLabs 클라이언트 (지연 초기화)"""
        if self._client is None:
            if not self.api_key:
                raise ValueError("ELEVENLABS_API_KEY가 환경변수에 설정되지 않았습니다.")
            self._client = ElevenLabs(api_key=self.api_key)
        return self._client
    
    def get_signed_url(self, agent_id: str) -> SignedUrlResponse:
        """Agent ID로 대화용 Signed URL 생성"""
        try:
            if not self.api_key:
                raise ValueError("ELEVENLABS_API_KEY가 설정되지 않았습니다.")
            
            logger.info(f"실제 ElevenLabs API 호출: Agent {agent_id[:15]}...")
            
            # 올바른 ElevenLabs API 경로로 호출
            response = self.client.conversational_ai.conversations.get_signed_url(agent_id=agent_id)
            
            logger.info(f"Signed URL 생성 완료: Agent {agent_id[:15]}...")
            
            return SignedUrlResponse(
                signed_url=response.signed_url,
                agent_id=agent_id,
                message="실제 대화용 URL이 생성되었습니다."
            )
            
        except Exception as e:
            logger.error(f"Signed URL 생성 실패: {e}")
            raise Exception(f"Signed URL 생성 실패: {str(e)}")
    
    def test_connection(self) -> bool:
        """ElevenLabs API 연결 테스트"""
        try:
            if not self.api_key:
                return False
            
            # 실제 API 호출로 테스트
            voices = self.client.voices.get_all()
            return True  # voices 응답이 있으면 성공
            
        except Exception as e:
            logger.error(f"ElevenLabs 연결 테스트 실패: {e}")
            return False

# 전역 ElevenLabs 서비스 인스턴스
_elevenlabs_service: Optional[ElevenLabsService] = None

def get_elevenlabs_service() -> ElevenLabsService:
    """ElevenLabs 서비스 인스턴스 반환"""
    global _elevenlabs_service
    if _elevenlabs_service is None:
        _elevenlabs_service = ElevenLabsService()
    return _elevenlabs_service

# 하위 호환성을 위한 전역 변수
elevenlabs_service = get_elevenlabs_service() 