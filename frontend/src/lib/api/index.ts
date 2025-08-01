import { VoiceListResponse, SignedUrlResponse, VoiceAgent, PublicIdToAgentResponse } from '../../types';

// API 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(
        `API 요청 실패: ${response.statusText}`,
        response.status,
        errorText
      );
    }

    return response.json();
  }

  // === Voice API ===
  
  async getVoiceList(userId?: string, limit: number = 50): Promise<VoiceListResponse> {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    params.append('limit', limit.toString());
    
    const queryString = params.toString();
    const endpoint = `/api/voices/list${queryString ? `?${queryString}` : ''}`;
    
    return this.request<VoiceListResponse>(endpoint);
  }

  async getVoiceByAgent(agentId: string): Promise<VoiceAgent> {
    return this.request<VoiceAgent>(`/api/voices/agent/${agentId}`);
  }

  async getAgentByPublicId(publicId: string): Promise<PublicIdToAgentResponse> {
    return this.request<PublicIdToAgentResponse>(`/api/voices/public/${publicId}`);
  }

  // === Conversation API ===
  
  async getSignedUrl(agentId: string): Promise<SignedUrlResponse> {
    const params = new URLSearchParams({ agent_id: agentId });
    return this.request<SignedUrlResponse>(`/api/conversations/signed-url?${params}`);
  }

  async getSignedUrlByPublicId(publicId: string): Promise<SignedUrlResponse> {
    const params = new URLSearchParams({ public_id: publicId });
    return this.request<SignedUrlResponse>(`/api/conversations/signed-url-by-public?${params}`);
  }

  async validateAgent(agentId: string): Promise<{ valid: boolean; message: string }> {
    return this.request<{ valid: boolean; message: string }>(`/api/conversations/validate-agent/${agentId}`);
  }

  // === Health Check ===
  
  async healthCheck(): Promise<{ status: string; database: string; voices_count: number }> {
    return this.request<{ status: string; database: string; voices_count: number }>('/health');
  }
}

// 싱글톤 인스턴스
export const apiService = new ApiService();

// 개별 함수들 (하위 호환성)
export const getVoiceList = (userId?: string, limit?: number) => 
  apiService.getVoiceList(userId, limit);

export const getSignedUrl = (agentId: string) => 
  apiService.getSignedUrl(agentId);

export const getSignedUrlByPublicId = (publicId: string) => 
  apiService.getSignedUrlByPublicId(publicId);

export const getAgentByPublicId = (publicId: string) => 
  apiService.getAgentByPublicId(publicId);

export const validateAgent = (agentId: string) => 
  apiService.validateAgent(agentId);

export { ApiError }; 