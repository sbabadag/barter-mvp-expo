-- Test notification system by creating test notifications
-- This will help us see if the database and hooks are working

-- First, check if notifications table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'notifications'
) as notifications_table_exists;

-- Check if user_push_tokens table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_push_tokens'
) as push_tokens_table_exists;

-- If notifications table doesn't exist, create it
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    data jsonb DEFAULT '{}'::jsonb,
    read boolean DEFAULT false,
    sent boolean DEFAULT false,
    delivery_method text DEFAULT 'in_app',
    listing_id text,
    bid_id text,
    message_id text,
    created_at timestamptz DEFAULT NOW(),
    sent_at timestamptz,
    read_at timestamptz,
    scheduled_for timestamptz DEFAULT NOW()
);

-- If user_push_tokens table doesn't exist, create it
CREATE TABLE IF NOT EXISTS public.user_push_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    token text NOT NULL,
    platform text NOT NULL,
    device_name text,
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_user_push_tokens_user_id ON public.user_push_tokens(user_id);

-- Grant permissions
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.user_push_tokens TO authenticated;

-- Create a simple function to add test notifications
CREATE OR REPLACE FUNCTION public.create_test_notification(
    p_user_id uuid,
    p_title text DEFAULT 'Test Notification',
    p_body text DEFAULT 'This is a test notification'
)
RETURNS uuid
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    new_id uuid;
BEGIN
    INSERT INTO public.notifications (
        id,
        user_id,
        type,
        title,
        body,
        data,
        delivery_method
    ) VALUES (
        gen_random_uuid(),
        p_user_id,
        'reminder',
        p_title,
        p_body,
        '{"test": true}'::jsonb,
        'in_app'
    )
    RETURNING id INTO new_id;
    
    RETURN new_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.create_test_notification TO authenticated;

-- Create a test notification for the current user (you'll need to replace the UUID)
-- Uncomment and replace with your actual user ID:
-- SELECT create_test_notification('f60082e2-4ca5-4534-a682-a30a7b039af9', 'Welcome!', 'Your notification system is working!');

-- Check existing notifications
SELECT COUNT(*) as total_notifications FROM public.notifications;

-- Success message
SELECT 'Notification system test setup complete! 🔔' as status;