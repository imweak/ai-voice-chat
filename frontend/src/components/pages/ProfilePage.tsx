'use client';

import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { User, Settings, LogOut, Mic, Calendar, ChevronRight, Edit } from 'lucide-react';

import { createClient } from '../../lib/supabase/client';
import { getUserDisplayInfo, log, logError } from '../../lib/utils';
import { User as UserType } from '../../types/auth';
import BottomNavigation from '../layout/BottomNavigation';

interface ProfilePageProps {
  user: UserType;
}

export default function ProfilePage({ user }: ProfilePageProps) {
  const router = useRouter();
  const supabase = createClient();
  const userInfo = getUserDisplayInfo(user);

  const handleLogout = useCallback(async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      router.push('/login');
      log('로그아웃 성공');
    } catch (err) {
      logError('로그아웃 실패', err);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  }, [supabase, router]);

  const handleEditProfile = useCallback(() => {
    // TODO: 프로필 편집 모달 또는 페이지
    alert('프로필 편집 기능은 곧 추가될 예정입니다.');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-transparent">
                AI-Streamer
              </h1>
            </div>
            
            <div className="w-5 h-5"></div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 pb-24">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* 사용자 정보 카드 */}
          <div className="card p-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {userInfo.avatarUrl ? (
                  <img
                    src={userInfo.avatarUrl}
                    alt="프로필"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                )}

              </div>
              
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
                  {userInfo.name}
                </h2>
                <p className="text-gray-400 text-sm sm:text-base">
                  {user.email}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-500 text-xs sm:text-sm">
                    가입일: {new Date(user.created_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 설정 메뉴 */}
          <div className="card p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>설정</span>
            </h3>
            
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-blue-400 text-sm">🔔</span>
                  </div>
                  <span className="text-white">알림 설정</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              
              <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-purple-400 text-sm">🔐</span>
                  </div>
                  <span className="text-white">계정 관리</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              
              <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-green-400 text-sm">💬</span>
                  </div>
                  <span className="text-white">고객 지원</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* 로그아웃 버튼 */}
          <div className="card p-6">
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      </main>

      {/* 하단 네비게이션 */}
      <BottomNavigation />
    </div>
  );
} 