from fastapi import APIRouter, HTTPException, Query, Depends
from supabase import Client
from typing import Optional

from app.database.supabase import get_supabase
from app.database.models import (
    SignedUrlRequest, 
    SignedUrlResponse, 
    AgentValidationResponse,
    VoiceRecord,
    PublicSignedUrlRequest
)
from app.services.elevenlabs import get_elevenlabs_service

router = APIRouter()

async def _validate_agent_exists(agent_id: str, supabase: Client) -> VoiceRecord:
    """Agent ID가 DB에 존재하는지 확인하고 레코드 반환"""
    try:
        result = supabase.table('voices')\
            .select('*')\
            .eq('agent_id', agent_id)\
            .single()\
            .execute()
        
        if not result.data:
            raise HTTPException(
                status_code=404, 
                detail=f"Agent ID '{agent_id}'를 찾을 수 없습니다."
            )
        
        return VoiceRecord(**result.data)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Agent 검증 중 오류 발생: {str(e)}"
        )

async def _create_signed_url_response(agent_id: str, voice_record: VoiceRecord) -> SignedUrlResponse:
    """Signed URL 생성 및 응답 객체 반환"""
    try:
        elevenlabs_service = get_elevenlabs_service()
        signed_url_response = elevenlabs_service.get_signed_url(agent_id)
        
        return SignedUrlResponse(
            signed_url=signed_url_response.signed_url,
            agent_id=agent_id,
            message=f"대화 준비 완료! 음성: {voice_record.file_name} ({voice_record.nickname or 'No nickname'})"
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Signed URL 생성 실패: {str(e)}"
        )

@router.get("/signed-url", response_model=SignedUrlResponse)
async def get_signed_url(
    agent_id: str = Query(..., description="ElevenLabs agent ID"),
    supabase: Client = Depends(get_supabase)
):
    """GET 방식으로 Signed URL 생성"""
    if not agent_id.strip():
        raise HTTPException(status_code=400, detail="Agent ID가 필요합니다.")
    
    voice_record = await _validate_agent_exists(agent_id, supabase)
    return await _create_signed_url_response(agent_id, voice_record)

@router.post("/signed-url", response_model=SignedUrlResponse)
async def create_signed_url(
    request: SignedUrlRequest,
    supabase: Client = Depends(get_supabase)
):
    """POST 방식으로 Signed URL 생성"""
    voice_record = await _validate_agent_exists(request.agent_id, supabase)
    return await _create_signed_url_response(request.agent_id, voice_record)

@router.get("/validate-agent/{agent_id}", response_model=AgentValidationResponse)
async def validate_agent(
    agent_id: str,
    supabase: Client = Depends(get_supabase)
):
    """Agent ID 유효성 검증"""
    try:
        voice_record = await _validate_agent_exists(agent_id, supabase)
        
        return AgentValidationResponse(
            valid=True,
            agent_id=agent_id,
            file_name=voice_record.file_name,
            nickname=voice_record.nickname,
            created_at=voice_record.created_at,
            message="유효한 Agent ID입니다."
        )
        
    except HTTPException as e:
        if e.status_code == 404:
            return AgentValidationResponse(
                valid=False,
                message=e.detail
            )
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"검증 실패: {str(e)}"
        )

async def _validate_public_id_exists(public_id: str, supabase: Client) -> VoiceRecord:
    """Public ID가 DB에 존재하는지 확인하고 레코드 반환"""
    try:
        result = supabase.table('voices')\
            .select('*')\
            .eq('public_id', public_id)\
            .single()\
            .execute()
        
        if not result.data:
            raise HTTPException(
                status_code=404, 
                detail=f"Public ID '{public_id}'를 찾을 수 없습니다."
            )
        
        return VoiceRecord(**result.data)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Public ID 검증 중 오류 발생: {str(e)}"
        )

@router.get("/signed-url-by-public", response_model=SignedUrlResponse)
async def get_signed_url_by_public_id(
    public_id: str,
    supabase: Client = Depends(get_supabase)
):
    """Public ID로 Signed URL 생성 (보안 라우팅용)"""
    try:
        # Public ID로 voice 레코드 조회
        voice_record = await _validate_public_id_exists(public_id, supabase)
        
        # Agent ID로 signed URL 생성
        response = await _create_signed_url_response(voice_record.agent_id, voice_record)
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Signed URL 생성 실패: {str(e)}"
        )

@router.post("/signed-url-by-public", response_model=SignedUrlResponse)
async def post_signed_url_by_public_id(
    request: PublicSignedUrlRequest,
    supabase: Client = Depends(get_supabase)
):
    """Public ID로 Signed URL 생성 (POST 방식)"""
    return await get_signed_url_by_public_id(request.public_id, supabase) 