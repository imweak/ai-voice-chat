'use client';

import { useRouter } from 'next/navigation';
import { User } from '../../types/auth';
import { useState, useEffect, useCallback } from 'react';

import { createClient } from '../../lib/supabase/client';
import { getVoiceList, ApiError } from '../../lib/api';
import { getUserDisplayInfo, formatDate, log, logError } from '../../lib/utils';
import { VoiceAgent, LoadingState } from '../../types';
import BottomNavigation from '../layout/BottomNavigation';

interface HomePageProps {
  user: User;
}

export default function HomePage({ user }: HomePageProps) {
  const router = useRouter();
  const supabase = createClient();
  const [voices, setVoices] = useState<VoiceAgent[]>([]);
  const [{ loading, error }, setLoadingState] = useState<LoadingState>({ 
    loading: true, 
    error: '' 
  });

  const userInfo = getUserDisplayInfo(user);

  // 음성 에이전트 목록 조회
  useEffect(() => {
    let isMounted = true; // cleanup을 위한 플래그

    const fetchVoices = async () => {
      try {
        if (isMounted) {
          setLoadingState({ loading: true, error: '' });
        }
        
        const data = await getVoiceList();
        
        if (isMounted) {
          setVoices(data.voices);
          log('음성 목록 로드 완료', { count: data.voices.length });
        }
        
      } catch (err) {
        const errorMessage = err instanceof ApiError 
          ? `${err.message} (${err.status})`
          : '음성 목록을 불러올 수 없습니다.';
          
        if (isMounted) {
          setLoadingState({ loading: false, error: errorMessage });
          logError('음성 목록 조회 실패', err);
        }
      } finally {
        if (isMounted) {
          setLoadingState(prev => ({ ...prev, loading: false }));
        }
      }
    };

    fetchVoices();

    // cleanup 함수
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChatRoomClick = useCallback((publicId: string): void => {
    log('채팅방 입장', { publicId });
    router.push(`/voice-chat?room=${publicId}`);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img 
                src="/ChatGPT Image 2025년 7월 24일 오전 10_28_54.png" 
                alt="AI-Streamer Logo" 
                className="w-6 h-6 sm:w-7 sm:h-7 rounded object-cover flex-shrink-0"
              />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                AI-Streamer
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 - 하단바를 위한 여백 추가 */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4 sm:space-y-6">
            <div className="card p-4 sm:p-6">


              {/* 채팅방 목록 컨테이너 - 고정 높이로 CLS 방지 */}
              <div className="min-h-[300px]">
                {/* 로딩 상태 */}
                {loading && (
                  <div className="text-center py-6 sm:py-8 flex flex-col items-center justify-center h-[300px]">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
                    <p className="text-gray-400 text-sm sm:text-base">음성 에이전트를 불러오는 중...</p>
                  </div>
                )}

                {/* 에러 상태 */}
                {error && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                    <p className="text-red-300 text-sm sm:text-base">{error}</p>
                    <p className="text-xs sm:text-sm text-red-400 mt-2">
                      Python 백엔드가 실행 중인지 확인해주세요 (http://localhost:8000)
                    </p>
                  </div>
                )}

                {/* 채팅방 목록 */}
                {!loading && !error && (
                  <div className="space-y-3 sm:space-y-4">
                    {voices.length === 0 ? (
                      <div className="text-center py-6 sm:py-8 flex flex-col items-center justify-center h-[300px]">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-600 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        </div>
                        <h3 className="text-white text-base sm:text-lg font-medium mb-2">등록된 음성 에이전트가 없습니다</h3>
                        <p className="text-gray-400 text-sm sm:text-base px-4">먼저 음성 파일을 업로드하여 에이전트를 생성해주세요.</p>
                      </div>
                    ) : (
                      voices.map((voice, index) => (
                        <div key={voice.id} className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 sm:p-6 border border-purple-500/30">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-sm sm:text-lg">{index + 1}</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="text-white text-sm sm:text-lg font-medium truncate">
                                  {voice.nickname || voice.file_name || `채팅방 ${index + 1}`}
                                </h3>
                              </div>
                            </div>
                            <button
                              onClick={() => handleChatRoomClick(voice.public_id)}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base flex-shrink-0"
                            >
                              <span>입장하기</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 하단 네비게이션 */}
      <BottomNavigation />
    </div>
  );
} 