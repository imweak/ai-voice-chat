'use client';

import { createClient } from '../../lib/supabase/client';
import { useState } from 'react';

export default function KakaoLoginButton() {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleKakaoLogin = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('카카오 로그인 오류:', error);
        alert('로그인 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('카카오 로그인 처리 중 오류:', error);
      alert('로그인 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleKakaoLogin}
      disabled={isLoading}
      className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-300 text-black font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
    >
      <svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M9 0C4.032 0 0 2.952 0 6.6c0 2.352 1.584 4.424 3.996 5.624l-1.032 3.864c-.096.36.264.648.588.456L7.788 13.8c.396.048.792.072 1.212.072 4.968 0 9-2.952 9-6.6S13.968 0 9 0z"
          fill="currentColor"
        />
      </svg>
      {isLoading ? '로그인 중...' : '카카오로 로그인'}
    </button>
  );
} 