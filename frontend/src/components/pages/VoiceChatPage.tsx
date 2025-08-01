"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '../../lib/supabase/client';
import { getUserDisplayInfo, log, logError } from '../../lib/utils';
import { getVoiceList, getAgentByPublicId, ApiError } from '../../lib/api';
import { User } from '../../types/auth';
import { VoiceAgent } from '../../types';
import EnhancedConversationAI from '../features/chat/EnhancedConversationAI';

interface VoiceChatPageProps {
  user: User;
}

export default function VoiceChatPage({ user }: VoiceChatPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const publicId = searchParams.get('room') || '';
  const [agentId, setAgentId] = useState<string>('');
  
  const [currentAgent, setCurrentAgent] = useState<VoiceAgent | null>(null);
  const userInfo = getUserDisplayInfo(user);

  // Public ID로 에이전트 정보 가져오기
  useEffect(() => {
    let isMounted = true; // cleanup을 위한 플래그

    const fetchAgentInfo = async () => {
      try {
        // Public ID로 Agent ID와 기본 정보 조회 (한 번의 API 호출만)
        const agentData = await getAgentByPublicId(publicId);
        
        if (isMounted) {
          setAgentId(agentData.agent_id);
          
          // getAgentByPublicId에서 받은 정보로 VoiceAgent 객체 구성
          const agent: VoiceAgent = {
            id: '', // 임시 값 (실제로는 사용되지 않음)
            user_id: agentData.user_id || '',
            voice_id: agentData.voice_id || '',
            agent_id: agentData.agent_id,
            file_name: agentData.file_name || '',
            nickname: agentData.nickname,
            public_id: agentData.public_id,
            created_at: agentData.created_at || new Date().toISOString()
          };
          
          setCurrentAgent(agent);
          log('에이전트 정보 로드 (최적화)', { 
            publicId, 
            agentId: agentData.agent_id.slice(0, 15), 
            nickname: agentData.nickname
          });
        }
      } catch (err) {
        if (isMounted) {
          logError('에이전트 정보 조회 실패', err);
          // Public ID가 잘못된 경우 홈으로 리다이렉트
          if (err instanceof ApiError && err.status === 404) {
            alert('존재하지 않는 채팅방입니다.');
            router.push('/');
          }
        }
      }
    };

    if (publicId) {
      fetchAgentInfo();
    } else {
      // Public ID가 없으면 홈으로 리다이렉트
      router.push('/');
    }

    // cleanup 함수
    return () => {
      isMounted = false;
    };
  }, [publicId]); // router 의존성 제거로 불필요한 재실행 방지

  const handleLogout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      router.push('/login');
      log('로그아웃 성공');
    } catch (err) {
      logError('로그아웃 실패', err);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  const goToHome = (): void => {
    router.push('/');
  };

  const displayNickname = currentAgent?.nickname || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* 뒤로가기 버튼 */}
              <button
                onClick={goToHome}
                className="text-lg sm:text-xl md:text-2xl font-bold text-white hover:text-purple-300 transition-colors"
              >
                ←
              </button>
            </div>

            {/* 중앙 닉네임 */}
            <div className="flex-1 flex justify-center">
              <div className="flex items-center">
                {displayNickname && (
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate max-w-xs sm:max-w-sm">
                    {displayNickname}
                  </h1>
                )}
              </div>
            </div>
            

          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 lg:py-10 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4 sm:space-y-6">
            {/* Enhanced Conversation Component */}
            <div className="card p-4 sm:p-6">
              <EnhancedConversationAI agentId={agentId} publicId={publicId} />
            </div>


          </div>
        </div>
      </main>
    </div>
  );
} 