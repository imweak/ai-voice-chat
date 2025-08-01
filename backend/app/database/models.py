from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# === Voice Models ===

class VoiceRecord(BaseModel):
    """음성 테이블 레코드"""
    id: str
    user_id: str
    voice_id: str
    agent_id: str
    file_name: str
    nickname: Optional[str] = None
    public_id: str = Field(..., description="공개용 식별자 (URL에 사용)")
    created_at: datetime

class VoiceListResponse(BaseModel):
    """음성 목록 응답"""
    voices: List[VoiceRecord]
    total: int
    message: str

class VoiceDetailResponse(BaseModel):
    """음성 상세 정보 응답"""
    voice: VoiceRecord
    message: str

# === Conversation Models ===

class SignedUrlRequest(BaseModel):
    """Signed URL 요청"""
    agent_id: str = Field(..., description="ElevenLabs agent ID")

class PublicSignedUrlRequest(BaseModel):
    """Public ID로 Signed URL 요청"""
    public_id: str = Field(..., description="공개용 식별자")

class SignedUrlResponse(BaseModel):
    """Signed URL 응답"""
    signed_url: str = Field(..., description="WebSocket 연결용 URL")
    agent_id: str = Field(..., description="사용된 agent ID")
    message: str = Field(..., description="응답 메시지")

class AgentValidationResponse(BaseModel):
    """Agent 유효성 검증 응답"""
    valid: bool
    agent_id: Optional[str] = None
    public_id: Optional[str] = None
    file_name: Optional[str] = None
    nickname: Optional[str] = None
    created_at: Optional[datetime] = None
    message: str

class PublicIdToAgentResponse(BaseModel):
    """Public ID를 Agent ID로 변환하는 응답"""
    agent_id: str = Field(..., description="실제 ElevenLabs agent ID")
    public_id: str = Field(..., description="공개용 식별자")
    nickname: Optional[str] = None
    file_name: Optional[str] = None
    voice_id: Optional[str] = None
    user_id: Optional[str] = None
    created_at: Optional[datetime] = None
    message: str

# === Common Models ===

class SuccessResponse(BaseModel):
    """성공 응답"""
    success: bool = True
    message: str
    data: Optional[dict] = None

class ErrorResponse(BaseModel):
    """에러 응답"""
    success: bool = False
    error: str = Field(..., description="에러 메시지")
    details: Optional[str] = Field(None, description="에러 상세사항")

class HealthCheckResponse(BaseModel):
    """헬스체크 응답"""
    status: str
    database: Optional[str] = None
    voices_count: Optional[int] = None
    error: Optional[str] = None

class StatsResponse(BaseModel):
    """통계 응답"""
    total_voices: int
    voices_with_agent: int
    message: str 