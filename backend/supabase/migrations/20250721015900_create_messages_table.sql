-- Create messages table for real-time 1:1 chat
-- Simple schema to start with, can be extended later for AI features

CREATE TABLE messages (
  -- Primary key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Message content
  content TEXT NOT NULL,
  
  -- User who sent the message
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Simple chatroom identifier (start with fixed "ai-streamer")
  chatroom_id TEXT NOT NULL DEFAULT 'ai-streamer',
  
  -- Message type for future AI integration
  message_type TEXT DEFAULT 'user_text' CHECK (message_type IN ('user_text', 'ai_text', 'ai_voice', 'system')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Policy: Users can read all messages in chatroom
CREATE POLICY "Users can read messages" ON messages 
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policy: Users can insert their own messages
CREATE POLICY "Users can insert own messages" ON messages 
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Policy: Users can update their own messages (for editing)
CREATE POLICY "Users can update own messages" ON messages 
  FOR UPDATE USING (auth.uid() = sender_id);

-- Create indexes for better performance
CREATE INDEX idx_messages_chatroom_created ON messages(chatroom_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_type ON messages(message_type);

-- Create updated_at trigger
CREATE TRIGGER update_messages_updated_at 
    BEFORE UPDATE ON messages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Add helpful comments
COMMENT ON TABLE messages IS 'Real-time chat messages for AI voice chat system';
COMMENT ON COLUMN messages.message_type IS 'Type: user_text, ai_text, ai_voice, system';
COMMENT ON COLUMN messages.chatroom_id IS 'Chatroom identifier, starts with ai-streamer for 1:1 AI chat';
