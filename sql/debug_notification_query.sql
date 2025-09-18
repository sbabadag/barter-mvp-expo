-- DEBUG NOTIFICATION QUERY ISSUE
-- Check why notifications aren't being fetched even though they're created

-- Step 1: Check if notifications exist for your user
SELECT 
    'Direct notification check:' as check_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE read = false) as unread_count
FROM public.notifications 
WHERE user_id = 'f60082e2-4ca5-4534-a682-a30a7b039af9'::uuid;

-- Step 2: Show actual notifications with details
SELECT 
    id,
    user_id,
    type,
    title,
    body,
    read,
    sent,
    delivery_method,
    created_at
FROM public.notifications 
WHERE user_id = 'f60082e2-4ca5-4534-a682-a30a7b039af9'::uuid
ORDER BY created_at DESC
LIMIT 10;

-- Step 3: Check if the specific test notification exists
SELECT 
    'Test notification check:' as check_type,
    id,
    title,
    body,
    created_at
FROM public.notifications 
WHERE id = '01f4240a-5be4-4f6b-b318-b2af20dc738b'::uuid;

-- Step 4: Check RLS policies on notifications table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'notifications';

-- Step 5: Test RLS by checking current user context
SELECT 
    'Current user check:' as check_type,
    auth.uid() as current_user_id,
    CASE 
        WHEN auth.uid() = 'f60082e2-4ca5-4534-a682-a30a7b039af9'::uuid 
        THEN '✅ User ID matches' 
        ELSE '❌ User ID mismatch' 
    END as user_match_status;

-- Step 6: Test the exact query the app would use
SELECT 
    id,
    user_id,
    type,
    title,
    body,
    data,
    read,
    sent,
    delivery_method,
    listing_id,
    bid_id,
    message_id,
    created_at,
    sent_at,
    read_at,
    scheduled_for
FROM public.notifications 
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

-- Step 7: Check if there are any other notifications in the table
SELECT 
    'All notifications check:' as check_type,
    COUNT(*) as total_notifications,
    COUNT(DISTINCT user_id) as unique_users
FROM public.notifications;

-- Step 8: Create a new test notification and immediately query it
INSERT INTO public.notifications (
    id, user_id, type, title, body, data, delivery_method, read, sent, created_at
) VALUES (
    gen_random_uuid(),
    'f60082e2-4ca5-4534-a682-a30a7b039af9'::uuid,
    'reminder',
    '🔍 Debug Test Notification',
    'This notification is created specifically for debugging the query issue',
    '{"debug": true, "timestamp": "' || NOW()::text || '"}'::jsonb,
    'in_app', false, true, NOW()
) RETURNING id, title, 'Notification created and should be immediately visible' as status;

-- Step 9: Final verification query
SELECT 
    'Final verification:' as check_type,
    COUNT(*) as total_notifications_for_user
FROM public.notifications 
WHERE user_id = 'f60082e2-4ca5-4534-a682-a30a7b039af9'::uuid;

SELECT '🔍 Debug query completed - check results above!' as final_status;