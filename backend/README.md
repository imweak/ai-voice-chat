# 🐍 AI Voice Chat FastAPI Backend

**기존 voices 테이블의 agent_id를 활용한 음성 대화 API 서버**

## 📁 프로젝트 구조

```
ai_voice_chat/backend/
├── app/
│   ├── main.py              # FastAPI 메인 애플리케이션
│   ├── database/            # Supabase 연결 및 모델
│   │   ├── supabase.py      # DB 클라이언트
│   │   └── models.py        # Pydantic 모델
│   ├── services/            # 외부 API 서비스
│   │   └── elevenlabs.py    # ElevenLabs API
│   └── routers/             # API 라우터
│       ├── voices.py        # 음성 목록 조회
│       └── conversations.py # 대화 URL 생성
├── requirements.txt         # Python 의존성
├── .env.example            # 환경변수 예시
└── run.py                  # 서버 실행 스크립트
```

## 🚀 빠른 시작

### 1. 환경 설정

```bash
# 1. 백엔드 디렉토리로 이동
cd ai_voice_chat/backend

# 2. 환경변수 파일 생성
cp .env.example .env

# 3. Python 의존성 설치
pip install -r requirements.txt
```

### 2. 서버 실행

```bash
# 개발 서버 실행 (자동 재시작)
python run.py

# 또는 직접 uvicorn 실행
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. API 확인

- **서버 주소**: http://localhost:8000
- **API 문서**: http://localhost:8000/docs  
- **헬스체크**: http://localhost:8000/health

## 🔌 API 엔드포인트

### 📋 음성 목록 조회
```http
GET /api/voices/list
GET /api/voices/stats
GET /api/voices/agent/{agent_id}
```

### 💬 대화 URL 생성
```http
GET /api/conversations/signed-url?agent_id={agent_id}
POST /api/conversations/signed-url
GET /api/conversations/validate-agent/{agent_id}
```

## 🗄️ 데이터베이스 연결

### Supabase 설정
- **동일한 DB 사용**: ai_voice_chat과 같은 Supabase 인스턴스
- **기존 데이터 활용**: streamer에서 저장한 agent_id 조회
- **voices 테이블**: 기존 구조 그대로 사용

### voices 테이블 구조
```sql
CREATE TABLE voices (
  id UUID PRIMARY KEY,
  user_id TEXT,
  voice_id TEXT,
  agent_id TEXT UNIQUE,  -- ElevenLabs agent ID
  file_name TEXT,
  nickname TEXT,
  created_at TIMESTAMPTZ
);
```

## 🎯 주요 기능

### 1. 기존 agent_id 목록 조회
```python
# 모든 음성 에이전트 조회
GET /api/voices/list

# 특정 사용자의 에이전트만 조회  
GET /api/voices/list?user_id=anonymous

# 통계 정보
GET /api/voices/stats
```

### 2. 대화용 signed URL 생성
```python
# agent_id로 대화 URL 생성
GET /api/conversations/signed-url?agent_id=agent_xxx

# 응답 예시
{
  "signed_url": "wss://api.elevenlabs.io/...",
  "agent_id": "agent_xxx",
  "message": "대화 준비 완료! 음성: sample.wav"
}
```

## 🔧 환경변수 설정

`.env` 파일에 다음 내용을 설정하세요:

```env
# ElevenLabs API Key
ELEVENLABS_API_KEY=sk_b3051a152984030de991de199df831add202628c72926eee

# Supabase Configuration (ai_voice_chat과 동일)
NEXT_PUBLIC_SUPABASE_URL=https://rstyfeylxmauvrkpurum.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server Configuration
PORT=8000
HOST=0.0.0.0
DEBUG=True
```

## 🔗 Next.js 프론트엔드 연동

### CORS 설정
FastAPI 서버는 다음 주소에서의 요청을 허용합니다:
- `http://localhost:3000` (Next.js 개발 서버)
- `http://localhost:3001` (ai_voice_chat 포트)

### API 호출 예시
```typescript
// 음성 목록 조회
const response = await fetch('http://localhost:8000/api/voices/list');
const data = await response.json();

// 대화 URL 생성
const urlResponse = await fetch(`http://localhost:8000/api/conversations/signed-url?agent_id=${agentId}`);
const { signed_url } = await urlResponse.json();
```

## 📊 로그 및 모니터링

### 서버 로그
```bash
# 서버 시작 시 표시되는 정보
🚀 AI Voice Chat FastAPI 서버 시작...
📖 기존 voices 테이블의 agent_id 활용
🔗 ElevenLabs 대화 기능 제공
===============================================
✅ ElevenLabs API Key: sk_b3051a1...
✅ Supabase URL: https://rstyfeylxmauvrkpurum.supabase.co
===============================================
🌟 서버 실행 중... (http://localhost:8000)
📚 API 문서: http://localhost:8000/docs
🏥 헬스체크: http://localhost:8000/health
```

### 헬스체크 응답
```json
{
  "status": "healthy",
  "database": "connected", 
  "voices_count": 5,
  "description": "기존 저장된 agent_id 활용 준비 완료"
}
```

## 🐛 문제 해결

### 1. ElevenLabs API 오류
```bash
# API 키 확인
echo $ELEVENLABS_API_KEY

# 로그에서 ElevenLabs 오류 확인
tail -f logs/app.log
```

### 2. Supabase 연결 오류
```bash
# 환경변수 확인
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# 헬스체크로 DB 연결 확인
curl http://localhost:8000/health
```

### 3. CORS 오류
Next.js에서 API 호출 시 CORS 오류가 발생하면:
- FastAPI 서버가 실행 중인지 확인
- `main.py`의 `allow_origins`에 프론트엔드 주소 추가

## 📝 다음 단계

백엔드 준비 완료 후:
1. **Next.js 프론트엔드 구현** (음성 대화 컴포넌트)
2. **ai_voice_chat 홈페이지에 "채팅방 1" 버튼 추가**
3. **통합 테스트** (전체 플로우 확인)

---

**📞 지원**: 백엔드 API 관련 문의사항이 있으면 개발팀에 연락하세요. 