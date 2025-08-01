declare module '@11labs/react' {
  export interface ConversationConfig {
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: any) => void;
    onMessage?: (message: any) => void;
  }

  export interface Conversation {
    status: string;
    isSpeaking: boolean;
    startSession: (config: { signedUrl: string }) => Promise<string>;
    endSession: () => Promise<void>;
    sendUserMessage: (message: string) => void;
    setVolume: (volume: number) => void;
    getId: () => string;
    sendFeedback: (feedback: any) => void;
    sendContextualUpdate: (update: any) => void;
    sendUserActivity: (activity: any) => void;
  }

  export function useConversation(config: ConversationConfig): Conversation;
}

declare module 'elevenlabs' {
  export interface ElevenLabsClient {
    voices: {
      add: (config: any) => Promise<{ voice_id: string }>;
    };
    conversationalAi: {
      createAgent: (config: any) => Promise<{ agent_id: string }>;
      getSignedUrl: (config: { agent_id: string }) => Promise<{ signed_url: string }>;
    };
  }

  export class ElevenLabsClient {
    constructor(config: { apiKey?: string });
  }
} 