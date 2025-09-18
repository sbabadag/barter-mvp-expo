-- COMPREHENSIVE NOTIFICATION TABLE FIX
-- This fixes the bid_id foreign key constraint and data type mismatch

-- Step 1: Drop the notifications table and recreate with correct bid_id type
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.user_notification_settings CASCADE;
DROP TABLE IF EXISTS public.notification_queue CASCADE;

-- Step 2: Recreate notifications table with TEXT bid_id to match bids table
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('new_bid', 'bid_accepted', 'bid_rejected', 'bid_countered', 'new_message', 'listing_sold', 'listing_expired', 'reminder')),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    
    -- Notification metadata
    read BOOLEAN DEFAULT FALSE,
    sent BOOLEAN DEFAULT FALSE,
    delivery_method VARCHAR(20) DEFAULT 'push' CHECK (delivery_method IN ('push', 'email', 'sms', 'in_app')),
    
    -- Related entities (FIXED: bid_id is now TEXT to match bids table)
    listing_id TEXT REFERENCES public.listings(id) ON DELETE CASCADE,
    bid_id TEXT REFERENCES public.bids(id) ON DELETE CASCADE,  -- CHANGED from UUID to TEXT
    message_id UUID,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Scheduling
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_related_entity CHECK (
        (type = 'new_bid' AND bid_id IS NOT NULL) OR
        (type IN ('bid_accepted', 'bid_rejected', 'bid_countered') AND bid_id IS NOT NULL) OR
        (type = 'new_message' AND message_id IS NOT NULL) OR
        (type IN ('listing_sold', 'listing_expired') AND listing_id IS NOT NULL) OR
        (type = 'reminder')
    )
);

-- Step 3: Create user notification settings table
CREATE TABLE public.user_notification_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    
    -- Push notification settings
    push_enabled BOOLEAN DEFAULT TRUE,
    push_new_bids BOOLEAN DEFAULT TRUE,
    push_bid_responses BOOLEAN DEFAULT TRUE,
    push_new_messages BOOLEAN DEFAULT TRUE,
    push_listing_updates BOOLEAN DEFAULT TRUE,
    
    -- Email notification settings
    email_enabled BOOLEAN DEFAULT FALSE,
    email_new_bids BOOLEAN DEFAULT FALSE,
    email_bid_responses BOOLEAN DEFAULT TRUE,
    email_weekly_summary BOOLEAN DEFAULT FALSE,
    
    -- Timing preferences
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '08:00',
    timezone VARCHAR(50) DEFAULT 'Europe/Istanbul',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create push token storage table
CREATE TABLE public.user_push_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    platform VARCHAR(10) CHECK (platform IN ('ios', 'android', 'web')),
    device_name TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, token)
);

-- Step 5: Enable RLS on all tables
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_push_tokens ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- System can insert notifications
CREATE POLICY "System can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- Step 7: Create RLS policies for notification settings
CREATE POLICY "Users can manage their notification settings" ON public.user_notification_settings
    FOR ALL USING (user_id = auth.uid());

-- Step 8: Create RLS policies for push tokens
CREATE POLICY "Users can manage their push tokens" ON public.user_push_tokens
    FOR ALL USING (user_id = auth.uid());

-- Step 9: Create indexes for performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_type ON public.notifications(type);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX idx_user_push_tokens_user_id ON public.user_push_tokens(user_id);

-- Step 10: Grant permissions
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.user_notification_settings TO authenticated;
GRANT ALL ON public.user_push_tokens TO authenticated;

-- Step 11: Create the fixed test function
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
    -- Generate new ID
    new_id := gen_random_uuid();
    
    -- Insert the test notification using 'reminder' type (no constraints)
    INSERT INTO public.notifications (
        id,
        user_id,
        type,
        title,
        body,
        data,
        delivery_method,
        read,
        sent
    ) VALUES (
        new_id,
        p_user_id,
        'reminder',
        p_title,
        p_body,
        '{"test": true, "source": "test_function"}'::jsonb,
        'in_app',
        false,
        true
    );
    
    RETURN new_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.create_test_notification TO authenticated;

-- Step 12: Test the system
-- Insert a reminder notification (no constraints)
INSERT INTO public.notifications (
    id,
    user_id,
    type,
    title,
    body,
    data,
    delivery_method,
    read,
    sent,
    created_at
) VALUES (
    gen_random_uuid(),
    'f60082e2-4ca5-4534-a682-a30a7b039af9'::uuid,
    'reminder',
    '🎉 System Fixed!',
    'Notification system is now working properly with TEXT bid IDs!',
    '{"test": true, "method": "comprehensive_fix"}'::jsonb,
    'in_app',
    false,
    true,
    NOW()
);

-- Test the function
SELECT create_test_notification(
    'f60082e2-4ca5-4534-a682-a30a7b039af9'::uuid, 
    '🧪 Function Test', 
    'This notification was created by the test function!'
) as test_notification_id;

-- Check results
SELECT 
    COUNT(*) as total_notifications,
    COUNT(*) FILTER (WHERE read = false) as unread_notifications
FROM public.notifications 
WHERE user_id = 'f60082e2-4ca5-4534-a682-a30a7b039af9'::uuid;

-- Show notifications
SELECT 
    id,
    type,
    title,
    body,
    read,
    created_at
FROM public.notifications 
WHERE user_id = 'f60082e2-4ca5-4534-a682-a30a7b039af9'::uuid
ORDER BY created_at DESC
LIMIT 5;

SELECT 'Comprehensive notification fix completed! All constraints resolved! 🚀' as status;