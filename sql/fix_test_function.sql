-- Simple fix: Create the missing create_test_notification function
-- Run this in Supabase SQL Editor

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
    
    -- Insert the test notification
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
        '{"test": true}'::jsonb,
        'in_app',
        false,
        true
    );
    
    RETURN new_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.create_test_notification TO authenticated;

-- Test the function immediately
SELECT create_test_notification(
    'f60082e2-4ca5-4534-a682-a30a7b039af9'::uuid, 
    'Test Notification 🧪', 
    'This test notification was created directly in SQL!'
) as test_notification_id;

-- Check if notification was created
SELECT COUNT(*) as notification_count FROM public.notifications 
WHERE user_id = 'f60082e2-4ca5-4534-a682-a30a7b039af9'::uuid;

SELECT 'Test function created and tested successfully! 🎉' as status;