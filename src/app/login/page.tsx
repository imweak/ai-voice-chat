import KakaoLoginButton from '../../components/auth/KakaoLoginButton';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            AI-Streamer
          </h1>
          <p className="text-gray-300 text-lg">
            실시간으로 AI 음성과 대화하세요
          </p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-white mb-2">
                로그인
              </h2>
              <p className="text-gray-300">
                카카오 계정으로 간편하게 시작하세요
              </p>
            </div>
            
            <KakaoLoginButton />
            
            <div className="text-center text-sm text-gray-400">
              로그인하면 서비스 이용약관과 개인정보처리방침에 동의하게 됩니다.
            </div>
          </div>
        </div>
        
        <div className="text-center text-gray-400 text-sm">
          <p>© 2024 AI Voice Chat. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
} 