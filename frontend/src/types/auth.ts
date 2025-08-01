// Supabase User 타입을 확장하여 사용
import { User as SupabaseUser } from '@supabase/supabase-js';

export type User = SupabaseUser;

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

export interface AuthError {
  message: string;
  status?: number;
}

export interface UserDisplayInfo {
  name: string;
  avatarUrl?: string;
} 