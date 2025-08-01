from fastapi import APIRouter, HTTPException, Depends, Query
from supabase import Client
from typing import Optional, List

from app.database.supabase import get_supabase
from app.database.models import (
    VoiceRecord, 
    VoiceListResponse, 
    VoiceDetailResponse,
    StatsResponse,
    PublicIdToAgentResponse
)

router = APIRouter()

@router.get("/list", response_model=VoiceListResponse)
async def get_voice_list(
    user_id: Optional[str] = Query(None, description="사용자 ID (없으면 전체 조회)"),
    limit: int = Query(50, ge=1, le=100, description="조회할 최대 개수 (1-100)"),
    supabase: Client = Depends(get_supabase)
):
    """음성 에이전트 목록 조회"""
    try:
        query = supabase.table('voices').select('*')
        
        # user_id 필터링
        if user_id:
            query = query.eq('user_id', user_id)
        
        # agent_id가 있는 레코드만 조회
        query = query.not_.is_('agent_id', 'null')
        
        # 최신순 정렬 및 제한
        result = query.order('created_at', desc=True).limit(limit).execute()
        
        voices = [VoiceRecord(**voice) for voice in result.data]
        
        return VoiceListResponse(
            voices=voices,
            total=len(voices),
            message=f"총 {len(voices)}개의 음성 에이전트를 찾았습니다."
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"음성 목록 조회 실패: {str(e)}"
        )

@router.get("/agent/{agent_id}", response_model=VoiceDetailResponse)
async def get_voice_by_agent(
    agent_id: str,
    supabase: Client = Depends(get_supabase)
):
    """특정 Agent ID로 음성 정보 조회"""
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
        
        voice = VoiceRecord(**result.data)
        
        return VoiceDetailResponse(
            voice=voice,
            message=f"Agent ID {agent_id[:15]}... 정보를 찾았습니다."
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"음성 조회 실패: {str(e)}"
        )

@router.get("/stats", response_model=StatsResponse)
async def get_voice_stats(
    supabase: Client = Depends(get_supabase)
):
    """음성 에이전트 통계 정보"""
    try:
        # 전체 레코드 수
        total_result = supabase.table('voices')\
            .select("count", count="exact")\
            .execute()
        
        # agent_id가 있는 레코드 수
        agent_result = supabase.table('voices')\
            .select("count", count="exact")\
            .not_.is_('agent_id', 'null')\
            .execute()
        
        return StatsResponse(
            total_voices=total_result.count or 0,
            voices_with_agent=agent_result.count or 0,
            message="voices 테이블 통계 정보"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"통계 조회 실패: {str(e)}"
        )

@router.get("/public/{public_id}", response_model=PublicIdToAgentResponse)
async def get_agent_by_public_id(
    public_id: str,
    supabase: Client = Depends(get_supabase)
):
    """Public ID로 Agent ID 조회 (보안 라우팅용)"""
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
        
        voice_data = result.data
        
        return PublicIdToAgentResponse(
            agent_id=voice_data['agent_id'],
            public_id=voice_data['public_id'],
            nickname=voice_data.get('nickname'),
            file_name=voice_data.get('file_name'),
            voice_id=voice_data.get('voice_id'),
            user_id=voice_data.get('user_id'),
            created_at=voice_data.get('created_at'),
            message=f"Agent ID 조회 성공: {voice_data.get('nickname') or voice_data.get('file_name', 'Unknown')}"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Public ID 조회 실패: {str(e)}"
        ) 