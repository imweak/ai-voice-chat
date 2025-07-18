# AI-Streamer 로그인 & 데이터베이스 연결 가이드

## 프로젝트 개요
AI-Streamer는 실시간 음성 클로닝 채팅 플랫폼으로, Next.js, Supabase, 카카오 OAuth를 사용하여 구축되었습니다.

## 기술 스택
- **프론트엔드**: Next.js 15, TypeScript, Tailwind CSS 3.4.0, React 19
- **백엔드**: Supabase (PostgreSQL)
- **인증**: 카카오 OAuth
- **상태관리**: @supabase/ssr (Server-Side Rendering)

## 1. Supabase 설정

### 1.1 Supabase 프로젝트 초기화
```bash
supabase init
npm install @supabase/supabase-js @supabase/ssr
```

### 1.2 환경변수 설정 (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://rstyfeylxmauvrkpurum.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 1.3 Supabase 클라이언트 설정
- `src/lib/supabase/client.ts`: 클라이언트 사이드 Supabase 클라이언트
- `src/lib/supabase/server.ts`: 서버 사이드 Supabase 클라이언트
- `src/lib/supabase/middleware.ts`: Next.js 미들웨어

## 2. 데이터베이스 스키마

### 2.1 Profiles 테이블 생성
```sql
-- Migration: 20250718034911_create_profiles_table.sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255),
    name VARCHAR(100),
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'viewer' CHECK (role IN ('viewer', 'streamer', 'admin')),
    social_login_provider VARCHAR(50),
    social_login_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- RLS (Row Level Security) 정책
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "프로필은 모든 사용자가 조회 가능" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "사용자는 자신의 프로필만 수정 가능" ON profiles
    FOR ALL USING (auth.uid() = id);
```

### 2.2 자동 프로필 생성 트리거
```sql
-- 새 사용자 가입 시 자동으로 profiles 테이블에 데이터 생성
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, name, avatar_url, social_login_provider, social_login_id)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_app_meta_data->>'provider',
        NEW.raw_user_meta_data->>'provider_id'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## 3. 카카오 OAuth 설정

### 3.1 카카오 개발자 콘솔 설정
- **REST API 키**: `03b515820f4a663b5a8384c04fd3c328`
- **Redirect URI**: `https://rstyfeylxmauvrkpurum.supabase.co/auth/v1/callback`
- **동의항목**: 닉네임, 프로필 사진

### 3.2 Supabase Authentication 설정
1. Supabase Dashboard → Authentication → Providers
2. Kakao Provider 활성화
3. Client ID, Client Secret 입력
4. Redirect URL 설정

## 4. 프론트엔드 구현

### 4.1 프로젝트 구조
```
src/
├── app/
│   ├── layout.tsx           # 루트 레이아웃
│   ├── page.tsx            # 홈페이지
│   ├── login/
│   │   └── page.tsx        # 로그인 페이지
│   └── auth/
│       └── callback/
│           └── route.ts    # OAuth 콜백 핸들러
├── components/
│   ├── HomePage.tsx        # 홈페이지 컴포넌트
│   └── auth/
│       └── KakaoLoginButton.tsx  # 카카오 로그인 버튼
├── lib/
│   └── supabase/          # Supabase 클라이언트 설정
└── types/
    └── auth.ts            # TypeScript 타입 정의
```

### 4.2 주요 컴포넌트

#### 카카오 로그인 버튼
```typescript
// src/components/auth/KakaoLoginButton.tsx
'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function KakaoLoginButton() {
  const supabase = createClientComponentClient()

  const handleKakaoLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) {
      console.error('카카오 로그인 오류:', error.message)
    }
  }

  return (
    <button
      onClick={handleKakaoLogin}
      className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3"
    >
      카카오 로그인
    </button>
  )
}
```

#### OAuth 콜백 핸들러
```typescript
// src/app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(requestUrl.origin)
}
```

## 5. 인증 플로우

### 5.1 로그인 과정
1. 사용자가 "카카오 로그인" 버튼 클릭
2. Supabase가 카카오 OAuth URL로 리다이렉트
3. 사용자가 카카오에서 로그인 및 동의
4. 카카오가 `/auth/callback`으로 authorization code와 함께 리다이렉트
5. 콜백 핸들러가 code를 세션으로 교환
6. 자동으로 홈페이지로 리다이렉트

### 5.2 자동 프로필 생성
- 새 사용자 가입 시 `handle_new_user()` 트리거 실행
- `auth.users` 테이블의 메타데이터를 `profiles` 테이블로 자동 복사
- 닉네임, 프로필 사진, 제공자 정보 등 저장

## 6. 보안 설정

### 6.1 Row Level Security (RLS)
- 모든 사용자가 프로필 조회 가능
- 사용자는 자신의 프로필만 수정 가능
- JWT 토큰 기반 인증으로 보안 강화

### 6.2 환경변수 보안
- `.env.local` 파일로 민감한 정보 관리
- `.gitignore`에 환경변수 파일 추가
- 프로덕션 환경에서는 환경변수로 설정

## 7. 테스트 결과

### 7.1 성공적인 기능들
- ✅ 카카오 OAuth 로그인/로그아웃
- ✅ 자동 프로필 생성
- ✅ 사용자 정보 표시 (이름, 프로필 사진)
- ✅ 반응형 디자인 (모바일/데스크톱)
- ✅ Next.js 15 호환성

### 7.2 확인된 사용자 데이터
- 사용자명: "원동준"
- 인증 제공자: 카카오
- 프로필 정보: 완전히 저장됨

## 8. 다음 단계
- [ ] 실시간 채팅 기능 구현
- [ ] ElevenLabs API 연동 (음성 클로닝)
- [ ] 스트리머/시청자 역할 구분
- [ ] 채팅방 관리 시스템

## 9. 개발 서버 실행
```bash
npm run dev
# 또는
yarn dev
```
서버는 `http://localhost:3001`에서 실행됩니다.

---
**참고**: 이 문서는 AI-Streamer 프로젝트의 로그인 및 데이터베이스 연결 구현 과정을 기록한 것입니다. 