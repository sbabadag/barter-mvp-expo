-- Create user_push_tokens table for storing device push notification tokens
-- This table manages push notification tokens for both iOS and Android devices

-- Drop existing table if it exists
DROP TABLE IF EXISTS public.user_push_tokens CASCADE;

-- Create user_push_tokens table
CREATE TABLE IF NOT EXISTS public.user_push_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
    device_name TEXT,
    device_id TEXT,
    app_version TEXT,
    os_version TEXT,
    
    -- Metadata
    active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one token per user per platform per device
    UNIQUE(user_id, platform, token)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_push_tokens_user_id ON public.user_push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_push_tokens_platform ON public.user_push_tokens(platform);
CREATE INDEX IF NOT EXISTS idx_user_push_tokens_active ON public.user_push_tokens(active);
CREATE INDEX IF NOT EXISTS idx_user_push_tokens_last_used ON public.user_push_tokens(last_used_at);

-- Enable Row Level Security
ALTER TABLE public.user_push_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see and manage their own tokens
CREATE POLICY "Users can view their own push tokens" ON public.user_push_tokens
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own push tokens" ON public.user_push_tokens
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own push tokens" ON public.user_push_tokens
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own push tokens" ON public.user_push_tokens
    FOR DELETE USING (auth.uid() = user_id);

-- Create a function to clean up old/inactive tokens
CREATE OR REPLACE FUNCTION cleanup_old_push_tokens()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Mark tokens as inactive if not used for 30 days
    UPDATE public.user_push_tokens
    SET active = FALSE
    WHERE last_used_at < NOW() - INTERVAL '30 days'
    AND active = TRUE;
    
    -- Delete inactive tokens older than 90 days
    DELETE FROM public.user_push_tokens
    WHERE active = FALSE 
    AND updated_at < NOW() - INTERVAL '90 days';
END;
$$;

-- Create a function to update last_used_at when token is accessed
CREATE OR REPLACE FUNCTION update_token_last_used()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.last_used_at = NOW();
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Create trigger to automatically update last_used_at
CREATE TRIGGER trigger_update_token_last_used
    BEFORE UPDATE ON public.user_push_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_token_last_used();

-- Insert some sample data for testing (optional)
-- Uncomment if you want to test with sample tokens
/*
INSERT INTO public.user_push_tokens (user_id, token, platform, device_name) VALUES
    ((SELECT id FROM auth.users LIMIT 1), 'ExponentPushToken[sample-ios-token]', 'ios', 'iPhone 14'),
    ((SELECT id FROM auth.users LIMIT 1), 'ExponentPushToken[sample-android-token]', 'android', 'Samsung Galaxy S23');
*/

-- Grant necessary permissions
GRANT ALL ON public.user_push_tokens TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Success message
SELECT 'Push tokens table created successfully! 🚀' as status;