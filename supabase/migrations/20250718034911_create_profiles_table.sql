-- Create profiles table for AI Voice Chat system
-- This table extends Supabase auth.users with additional profile information

CREATE TABLE profiles (
  -- Primary key references Supabase auth.users
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  
  -- Basic user information
  username VARCHAR(50) UNIQUE,
  display_name VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar_url TEXT,
  
  -- User role and status
  user_type VARCHAR(20) DEFAULT 'viewer' CHECK (user_type IN ('viewer', 'streamer', 'admin')),
  account_status VARCHAR(20) DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'banned', 'pending')),
  is_verified BOOLEAN DEFAULT false,
  
  -- Streamer-specific fields
  streamer_name VARCHAR(100),
  streaming_category VARCHAR(50),
  follower_count INTEGER DEFAULT 0,
  
  -- Social login information
  social_provider VARCHAR(20) CHECK (social_provider IN ('kakao', 'google', 'apple', 'naver')),
  social_id VARCHAR(255),
  
  -- Current session tracking
  current_session_id UUID,
  current_chat_room_id UUID,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  PRIMARY KEY (id),
  UNIQUE(social_provider, social_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles 
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can insert their own profile  
CREATE POLICY "Users can insert own profile" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_email ON profiles(email);  
CREATE INDEX idx_profiles_user_type ON profiles(user_type);
CREATE INDEX idx_profiles_social_provider_id ON profiles(social_provider, social_id);
CREATE INDEX idx_profiles_created_at ON profiles(created_at);

-- Add helpful comments
COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth.users for AI Voice Chat system';
COMMENT ON COLUMN profiles.user_type IS 'Role: viewer (normal user), streamer (content creator), admin (system admin)';
COMMENT ON COLUMN profiles.account_status IS 'Account state: active, suspended, banned, pending';
COMMENT ON COLUMN profiles.social_provider IS 'OAuth provider: kakao, google, apple, naver';
