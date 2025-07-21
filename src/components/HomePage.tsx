'use client';

import { createClient } from '../lib/supabase/client';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';

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
      <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
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
        <div className="max-w-2xl mx-auto">
          {/* 채팅방 목록 */}
          <div>
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                채팅방 목록
              </h2>
              <div className="space-y-3">
                <Link href="/chat/ai-streamer" className="block p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">AI</span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">AI 스트리머 채팅방</h3>
                      <p className="text-gray-400 text-sm">실시간 음성 대화</p>
                    </div>
                  </div>
                </Link>
                
                <div className="text-center py-8 text-gray-400">
                  더 많은 채팅방이 곧 추가될 예정입니다.
                </div>
              </div>
            </div>
          </div>


        </div>
      </main>
    </div>
  );
} 