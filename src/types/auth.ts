export interface Profile {
  id: string;
  user_id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  role: 'viewer' | 'streamer' | 'admin';
  kakao_id?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    avatar_url?: string;
    email?: string;
    full_name?: string;
    iss?: string;
    name?: string;
    picture?: string;
    provider_id?: string;
    sub?: string;
  };
}

export interface AuthError {
  message: string;
  status?: number;
} 