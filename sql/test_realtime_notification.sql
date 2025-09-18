-- Direct notification creation for immediate testing
-- Run this after the fix_test_function.sql

-- Insert a notification directly
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
    'new_bid',
    '🚀 Real-time Test',
    'If you see this in your app, real-time notifications are working!',
    '{"test": true, "method": "direct_insert"}'::jsonb,
    'in_app',
    false,
    true,
    NOW()
);

-- Check total notifications for your user
SELECT 
    COUNT(*) as total_notifications,
    COUNT(*) FILTER (WHERE read = false) as unread_notifications
FROM public.notifications 
WHERE user_id = 'f60082e2-4ca5-4534-a682-a30a7b039af9'::uuid;

-- Show recent notifications
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

SELECT 'Direct notification inserted! Check your app for real-time update! 📱' as status;