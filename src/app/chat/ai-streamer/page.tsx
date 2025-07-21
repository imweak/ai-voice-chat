'use client'

import { RealtimeChat } from '@/components/chat/realtime-chat'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import type { ChatMessage } from '@/hooks/chat/use-realtime-chat'

export default function AIStreamerChatPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const previousMessageCountRef = useRef(0)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }
      
      setUser(user)
      setLoading(false)
    }

    getUser()
  }, [router, supabase.auth])

  const handleNewMessages = (messages: ChatMessage[]) => {
    const currentCount = messages.length
    const previousCount = previousMessageCountRef.current
    
    if (currentCount > previousCount) {
      // 새로 추가된 메시지들만 로그 출력
      const newMessages = messages.slice(previousCount)
      console.log(`📨 새 메시지 ${newMessages.length}개 추가:`, newMessages)
      
      // TODO: 여기서 나중에 Supabase DB에 저장하고 AI 응답 로직 추가
      newMessages.forEach(msg => {
        console.log(`💬 ${msg.user.name}: ${msg.content}`)
      })
    }
    
    previousMessageCountRef.current = currentCount
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-white text-lg">로딩 중...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const username = user.user_metadata?.userName || user.user_metadata?.name || user.email || 'Anonymous'

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">
                AI 스트리머 채팅방
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-white font-medium text-sm">
                {username}
              </span>
              <button
                onClick={() => router.push('/')}
                className="btn-secondary text-sm px-4 py-2"
              >
                뒤로가기
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 채팅 컨테이너 */}
      <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-80px)]">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 h-full">
          <RealtimeChat
            roomName="ai-streamer"
            username={username}
            onMessage={handleNewMessages}
          />
        </div>
      </div>
    </div>
  )
} 