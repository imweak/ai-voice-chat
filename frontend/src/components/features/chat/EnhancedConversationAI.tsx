"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { useConversation } from "@11labs/react";
import { Mic, MicOff, Phone, PhoneOff, Send, MessageSquare } from "lucide-react";

import { getSignedUrl, getSignedUrlByPublicId, getAgentByPublicId, ApiError } from '../../../lib/api';
import { 
  requestMicrophonePermission, 
  generateId, 
  formatTime,
  scrollToBottom,
  log,
  logError,
  getErrorMessage
} from '../../../lib/utils';
import { ChatMessage, ConversationStatus } from '../../../types';

interface EnhancedConversationAIProps {
  agentId: string;
  publicId?: string; // public_id가 있으면 이를 우선 사용
}

interface DebugLog {
  id: string;
  timestamp: string;
  message: string;
  level: 'info' | 'warn' | 'error';
}

export default function EnhancedConversationAI({ agentId, publicId }: EnhancedConversationAIProps) {
  // State 관리 (최적화)
  const [conversationId, setConversationId] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);

  // Refs
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // 채팅 메시지 자동 스크롤 (로깅 제거로 최적화)
  useEffect(() => {
    if (chatContainerRef.current && chatMessages.length > 0) {
      scrollToBottom(chatContainerRef.current);
    }
  }, [chatMessages]);

  // useConversation 콜백들 최적화
  const onConnect = useCallback(() => {
    log('WebSocket 연결됨');
  }, []);

  const onDisconnect = useCallback(() => {
    log('WebSocket 연결 해제됨');
    setConversationId("");
  }, []);

  const onError = useCallback((error: any) => {
    const errorMsg = getErrorMessage(error);
    logError('대화 오류', error);
    alert(`대화 중 오류가 발생했습니다: ${errorMsg}`);
  }, []);

  // 메시지 처리 함수 (채팅 메시지 추가)
  const handleIncomingMessage = useCallback((message: any) => {
    switch(message.type) {
      case "agent_response":
        if (message.agent_response) {
          const agentMessage: ChatMessage = {
            id: generateId(),
            type: 'agent',
            content: message.agent_response,
            timestamp: new Date(),
            isAudio: false
          };
          setChatMessages(prev => [...prev, agentMessage]);
        }
        break;
        
      case "user_transcript": 
        if (message.user_transcript) {
          const userMessage: ChatMessage = {
            id: generateId(),
            type: 'user',
            content: message.user_transcript,
            timestamp: new Date(),
            isAudio: true
          };
          setChatMessages(prev => [...prev, userMessage]);
        }
        break;
        
      case "conversation_initiation_metadata":
        log('대화 초기화 완료');
        break;
      case "interruption":
        log('대화 중단 이벤트');
        break;
      default:
        // 기타 메시지는 로깅하지 않음 (성능 최적화)
        break;
    }
  }, []);

  const onMessage = useCallback((message: any) => {
    handleIncomingMessage(message);
  }, [handleIncomingMessage]);

  // ElevenLabs 대화 훅 (최적화된 콜백 사용)
  const conversation = useConversation({
    onConnect,
    onDisconnect,
    onError,
    onMessage,
  });

  // 텍스트 메시지 전송
  const sendTextMessage = useCallback((): void => {
    if (!textInput.trim()) return;
    
    if (conversation.isSpeaking) {
      log('AI가 말하는 중이라 텍스트 전송 차단');
      return;
    }
    
    // UI에 사용자 메시지 추가
    const userMessage: ChatMessage = {
      id: generateId(),
      type: 'user',
      content: textInput,
      timestamp: new Date(),
      isAudio: false
    };
    setChatMessages(prev => [...prev, userMessage]);
    
    // ElevenLabs에 텍스트 메시지 전송
    try {
      conversation.sendUserMessage(textInput);
      log('텍스트 메시지 전송 성공');
    } catch (error) {
      logError('텍스트 메시지 전송 실패', error);
    }
    
    setTextInput("");
  }, [textInput, conversation]);

  // 대화 시작 - 성능 최적화
  const startConversation = useCallback(async (): Promise<void> => {
    if (!agentId && !publicId) {
      alert("먼저 에이전트를 선택해주세요.");
      return;
    }

    // 즉시 상태 변경으로 사용자 피드백 제공
    setIsConnecting(true);

    try {
      // 마이크 권한 확인을 별도 태스크로 분리
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        alert("마이크 권한이 필요합니다.");
        setIsConnecting(false);
        return;
      }

      log('대화 시작 시도', { 
        agentId: agentId?.slice(0, 15), 
        publicId 
      });
      
      // API 호출을 별도 태스크로 처리
      let response;
      if (publicId) {
        response = await getSignedUrlByPublicId(publicId);
      } else {
        response = await getSignedUrl(agentId);
      }
      
      // WebSocket 연결을 별도 태스크로 처리
      const newConversationId = await conversation.startSession({ 
        signedUrl: response.signed_url 
      });
      
      setConversationId(newConversationId);
      log('대화 시작 성공', { conversationId: newConversationId });
      
    } catch (error) {
      const errorMsg = error instanceof ApiError
        ? `${error.message} (${error.status})`
        : getErrorMessage(error);
        
      logError('대화 시작 오류', error);
      alert(`대화를 시작할 수 없습니다. ${errorMsg}`);
    } finally {
      setIsConnecting(false);
    }
  }, [agentId, publicId, conversation]);

  // 대화 종료
  const stopConversation = useCallback(async (): Promise<void> => {
    log('대화 종료 시도');
    
    await conversation.endSession();
    setConversationId("");
    setChatMessages([]);
    
    log('대화 종료 완료');
  }, [conversation]);

  // 상태 텍스트 및 색상
  const getStatusText = (): string => {
    if (conversationId) {
      if (conversation.isSpeaking) {
        return "AI가 말하고 있습니다";
      } else if (conversation.status === 'connected') {
        return "처리 중... (텍스트/음성 인식 중)";
      } else {
        return "대기 중 (음성 + 텍스트 입력 가능)";
      }
    }
    return "연결 해제됨";
  };

  const getStatusColor = (): string => {
    if (conversationId) {
      if (conversation.isSpeaking) {
        return "text-green-400";
      } else if (conversation.status === 'connected') {
        return "text-orange-400";
      } else {
        return "text-blue-400";
      }
    }
    return "text-gray-400";
  };

  // Agent ID나 Public ID가 없는 경우
  if (!agentId && !publicId) {
    return (
      <div className="text-center py-12">
        <Mic className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-300">
          에이전트를 선택해주세요
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 상태 표시 */}
      <div className="text-center">
        <div
          className={`mx-auto mb-3 sm:mb-4 ${
            conversationId && conversation.isSpeaking
              ? "orb-active animate-orb"
              : conversationId && conversation.status === 'connected'
              ? "orb-active animate-pulse"
              : conversationId
              ? "animate-orb-slow orb-inactive"
              : "orb-inactive"
          }`}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #6366f1, #8b5cf6, #d946ef)',
            boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)',
            transition: 'all 0.3s ease'
          }}
        />
        
        <h3 className={`text-base sm:text-lg font-semibold ${getStatusColor()}`}>
          {getStatusText()}
        </h3>
        

      </div>

      {/* 채팅 메시지 */}
      {chatMessages.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4 max-h-60 sm:max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-700" ref={chatContainerRef}>
          <h4 className="font-medium text-white mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
            대화 내역 ({chatMessages.length}개)
          </h4>
          <div className="space-y-2">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-xs px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm ${
                    message.type === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-100 border border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-1 mb-1">
                    {message.isAudio && <Mic className="w-2 h-2 sm:w-3 sm:h-3" />}
                    <span className="text-xs opacity-75">
                      {message.type === 'user' ? '나' : 'AI'}
                    </span>
                    <span className="text-xs opacity-50">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  <div className="break-words">{message.content}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 컨트롤 버튼 */}
      <div className="space-y-3">
        {!conversationId ? (
          <button
            onClick={startConversation}
            disabled={isConnecting}
            className="w-full bg-green-600 text-white py-2 sm:py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-green-500 disabled:cursor-wait transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {isConnecting ? (
              <>
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                연결 중...
              </>
            ) : (
              <>
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                대화 시작
              </>
            )}
          </button>
        ) : (
          <>
            {/* 텍스트 입력 */}
            <div className="flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !conversation.isSpeaking && sendTextMessage()}
                placeholder={conversation.isSpeaking ? "AI가 말하는 중..." : "텍스트로 입력하세요..."}
                className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400 disabled:bg-gray-900/50 disabled:text-gray-500 text-sm sm:text-base"
                disabled={!conversationId || conversation.isSpeaking}
              />
              <button
                onClick={sendTextMessage}
                disabled={!textInput.trim() || !conversationId || conversation.isSpeaking}
                className="px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                title={conversation.isSpeaking ? "AI가 말하는 중입니다" : "메시지 전송"}
              >
                <Send className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* 음성 상태 표시 */}
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-300 py-1">
              {conversation.isSpeaking ? (
                <>
                  <MicOff className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                  <span className="text-red-400 font-medium text-center">AI가 말하는 중 (마이크 비활성)</span>
                </>
              ) : (
                <>
                  <Mic className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                  <span className="text-green-400 font-medium text-center">말씀해주세요 (마이크 활성)</span>
                </>
              )}
            </div>

            {/* 대화 종료 버튼 */}
            <button
              onClick={stopConversation}
              className="w-full bg-red-600 text-white py-2 sm:py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <PhoneOff className="w-4 h-4 sm:w-5 sm:h-5" />
              대화 종료
            </button>
          </>
        )}
      </div>

      {/* 사용 방법 */}
      <div className="bg-gray-800/30 rounded-lg p-3 sm:p-4 border border-gray-700/50">
        <h4 className="font-medium text-white mb-2 text-sm sm:text-base">사용 방법:</h4>
        <ol className="text-xs sm:text-sm text-gray-300 space-y-1">
          <li>1. "대화 시작" 버튼을 클릭하세요</li>
          <li>2. 마이크 권한을 허용하세요</li>
          <li>3. <strong>음성</strong>: AI와 자연스럽게 말하세요</li>
          <li>4. <strong>텍스트</strong>: 하단 입력창에 타이핑하세요</li>
          <li>5. AI가 복제된 목소리로 답변합니다</li>
          <li>6. 완료되면 "대화 종료"를 클릭하세요</li>
        </ol>
        
        <div className="mt-3 pt-3 border-t border-gray-700/50">
          <h5 className="text-xs sm:text-sm font-medium text-gray-200 mb-2">💡 상태 표시:</h5>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• <span className="text-green-400 font-medium">AI가 말하고 있습니다</span> - AI 음성 출력 중</li>
            <li>• <span className="text-orange-400 font-medium">처리 중...</span> - 텍스트/음성 인식 중</li>
            <li>• <span className="text-blue-400 font-medium">대기 중</span> - 마이크 활성</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 