/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@supabase/supabase-js'],
  
  // CSS 최적화 설정 (preload 경고 해결)
  experimental: {
    // optimizeCss: true, // 제거 - preload 경고 원인
    optimizePackageImports: ['lucide-react'],
  },
  
  // 불필요한 preload 방지
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // 추가 최적화 설정
  output: 'standalone',
  
  // CSS-in-JS 최적화
  transpilePackages: ['@11labs/react'],
}

module.exports = nextConfig 