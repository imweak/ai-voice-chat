import { User } from '@supabase/supabase-js';
import { UserDisplayInfo } from '../types';

// === 날짜 관련 유틸리티 ===

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return `${formatDate(dateString)} ${formatTime(date)}`;
};

// === 사용자 정보 유틸리티 ===

export const getUserDisplayInfo = (user: User): UserDisplayInfo => {
  const displayName = user.user_metadata?.full_name || 
                     user.user_metadata?.name || 
                     user.email;
  const avatarUrl = user.user_metadata?.avatar_url || 
                   user.user_metadata?.picture;
  
  return {
    name: displayName || '사용자',
    avatarUrl
  };
};

// === 미디어 권한 유틸리티 ===

export const requestMicrophonePermission = async (): Promise<boolean> => {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    return true;
  } catch (error) {
    console.error("마이크 권한이 거부되었습니다:", error);
    return false;
  }
};

export const checkMicrophonePermission = async (): Promise<PermissionState> => {
  try {
    const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
    return result.state;
  } catch {
    return 'prompt';
  }
};

// === 문자열 유틸리티 ===

export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// === 에러 처리 유틸리티 ===

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return '알 수 없는 오류가 발생했습니다.';
};

// === 개발 환경 유틸리티 ===

export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

export const log = (message: string, ...args: any[]): void => {
  if (isDevelopment()) {
    console.log(`[${new Date().toISOString()}] ${message}`, ...args);
  }
};

export const logError = (message: string, error?: unknown): void => {
  if (isDevelopment()) {
    console.error(`[${new Date().toISOString()}] ${message}`, error);
  }
};

// === 스크롤 유틸리티 ===

export const scrollToBottom = (element: HTMLElement, smooth: boolean = true): void => {
  element.scrollTo({
    top: element.scrollHeight,
    behavior: smooth ? 'smooth' : 'auto'
  });
}; 