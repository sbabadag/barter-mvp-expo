-- SIMPLE NOTIFICATION DEBUG - One query at a time
-- Run these queries ONE BY ONE to see each result

-- Query 1: Check if notifications exist for your user
SELECT 
    COUNT(*) as total_notifications,
    COUNT(*) FILTER (WHERE read = false) as unread_notifications,
    COUNT(*) FILTER (WHERE type = 'reminder') as reminder_notifications
FROM public.notifications 
WHERE user_id = 'f60082e2-4ca5-4534-a682-a30a7b039af9'::uuid;