import { createClient } from '../../../lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
      const supabase = await createClient();
      
      await supabase.auth.exchangeCodeForSession(code);
    }

    // 인증 성공 시 홈페이지로 리다이렉트
    return NextResponse.redirect(new URL('/', requestUrl.origin));
  } catch (error) {
    console.error('OAuth 콜백 처리 오류:', error);
    // 오류 시 로그인 페이지로 리다이렉트
    return NextResponse.redirect(new URL('/login', request.url));
  }
} 