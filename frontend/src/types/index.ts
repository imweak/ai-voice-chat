// === Common Types ===
export interface BaseResponse {
  message: string;
}

export interface ErrorResponse extends BaseResponse {
  error: string;
  details?: string;
}

// === Voice & Agent Types ===
export interface VoiceAgent {
  id: string;
  user_id: string;
  voice_id: string;
  agent_id: string;
  file_name: string;
  nickname: string | null;
  public_id: string;
  created_at: string;
}

export interface VoiceListResponse extends BaseResponse {
  voices: VoiceAgent[];
  total: number;
}

export interface SignedUrlResponse extends BaseResponse {
  signed_url: string;
  agent_id: string;
}

export interface PublicIdToAgentResponse extends BaseResponse {
  agent_id: string;
  public_id: string;
  nickname: string | null;
  file_name?: string | null;
  voice_id?: string | null;
  user_id?: string | null;
  created_at?: string | null;
}

// === Chat Types ===
export interface ChatMessage {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  isAudio?: boolean;
}

export type ConversationStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// === UI Types ===
export interface LoadingState {
  loading: boolean;
  error: string;
}

export interface DebugLog {
  timestamp: string;
  message: string;
  level: 'info' | 'warn' | 'error';
}

// Re-export auth types
export * from './auth'; 