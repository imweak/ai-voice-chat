'use client';

import { createClient } from '../lib/supabase/client';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

interface HomePageProps {
  user: User;
}

export default function HomePage({ user }: HomePageProps) {
  const router = useRouter();
  const supabase = createClient();

  console.log('User data:', user);
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email;
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  
  // 사용자 데이터가 없으면 기본값 사용
  const safeName = displayName || '사용자';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* 헤더 */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">
                AI-Streamer
              </h1>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4 flex-nowrap">
              <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
                {avatarUrl && (
                  <img
                    src={avatarUrl}
                    alt="프로필"
                    className="w-6 h-6 md:w-8 md:h-8 rounded-full flex-shrink-0"
                  />
                )}
                <span className="text-white font-medium text-sm md:text-base">
                  {safeName}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="btn-secondary text-xs md:text-sm px-2 md:px-4 py-1 md:py-2 flex-shrink-0"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 채팅방 목록 */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                채팅방 목록
              </h2>
              <div className="space-y-3">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">AI</span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">AI 스트리머 채팅방</h3>
                      <p className="text-gray-400 text-sm">실시간 음성 대화</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-center py-8 text-gray-400">
                  더 많은 채팅방이 곧 추가될 예정입니다.
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽: 메인 콘텐츠 */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-4">
                  AI-Streamer에 오신 것을 환영합니다!
                </h2>
                
                <p className="text-gray-300 mb-8 max-w-md mx-auto">
                  실시간으로 AI 스트리머와 음성으로 대화하고, 
                  텍스트와 음성 간의 자유로운 소통을 경험해보세요.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="btn-primary px-6 py-3">
                    첫 번째 채팅방 입장하기
                  </button>
                  
                  <button className="btn-secondary px-6 py-3">
                    사용법 알아보기
                  </button>
                </div>
                
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl mb-2">🎙️</div>
                    <h3 className="text-white font-medium mb-1">음성 대화</h3>
                    <p className="text-gray-400 text-sm">실시간 음성 채팅</p>
                  </div>
                  
                  <div>
                    <div className="text-2xl mb-2">🤖</div>
                    <h3 className="text-white font-medium mb-1">AI 클로닝</h3>
                    <p className="text-gray-400 text-sm">개성 있는 AI 목소리</p>
                  </div>
                  
                  <div>
                    <div className="text-2xl mb-2">💬</div>
                    <h3 className="text-white font-medium mb-1">실시간 채팅</h3>
                    <p className="text-gray-400 text-sm">즉석 소통</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 