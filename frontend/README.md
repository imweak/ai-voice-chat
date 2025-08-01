# 🤖 AI-Streamer Platform

Next.js와 Supabase를 사용한 AI 스트리머 플랫폼

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── auth/
│   │   └── callback/              # 소셜 로그인 콜백
│   ├── login/
│   │   └── page.tsx              # 로그인 페이지
│   ├── globals.css               # 전역 CSS 및 디자인 토큰
│   ├── layout.tsx
│   └── page.tsx                  # 메인 페이지
├── components/
│   ├── auth/
│   │   └── KakaoLoginButton.tsx  # 카카오 로그인 버튼
│   ├── ui/
│   │   ├── button.tsx            # 재사용 가능한 버튼 컴포넌트
│   │   └── input.tsx             # 재사용 가능한 입력 컴포넌트
│   └── HomePage.tsx              # 메인 홈페이지 컴포넌트
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Supabase 클라이언트 설정
│   │   ├── middleware.ts         # 인증 미들웨어
│   │   └── server.ts             # 서버 사이드 클라이언트
│   └── utils.ts                  # 유틸리티 함수
├── types/
│   └── auth.ts                   # 인증 관련 타입
└── hooks/                        # 커스텀 훅 디렉토리
```

## 🔧 기술 스택

- **Frontend**: Next.js 13+ (App Router)
- **Styling**: Tailwind CSS with CSS Variables
- **Authentication**: Supabase Auth (카카오 소셜 로그인)
- **Database**: Supabase PostgreSQL
- **TypeScript**: 완전한 타입 안전성
- **UI**: 모던 디자인 시스템

## 🚀 주요 기능

- **소셜 로그인**: 카카오 계정을 통한 간편 로그인
- **반응형 디자인**: 모바일과 데스크톱 환경 모두 지원
- **모던 UI**: Tailwind CSS를 활용한 아름다운 사용자 인터페이스
- **타입 안전성**: TypeScript를 통한 완전한 타입 체크

## 🛠️ 개발 환경 설정

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 변수들을 설정:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. Supabase 설정
```bash
# Supabase CLI 로그인
npx supabase login

# 프로젝트 연결
npx supabase link --project-ref your_project_ref

# 마이그레이션 적용
npx supabase db push
```

## 📊 데이터베이스 스키마

### Profiles 테이블
사용자 프로필 정보를 저장하는 테이블

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🎨 디자인 시스템

프로젝트는 일관된 디자인 토큰을 사용합니다:

- **Color Palette**: Purple gradient backgrounds
- **Typography**: Inter font family
- **Components**: Reusable UI components
- **Responsive**: Mobile-first approach

## 📝 라이센스

MIT License 