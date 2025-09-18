-- Query 2: Show actual notifications
SELECT 
    id,
    type,
    title,
    body,
    read,
    sent,
    created_at
FROM public.notifications 
WHERE user_id = 'f60082e2-4ca5-4534-a682-a30a7b039af9'::uuid
ORDER BY created_at DESC
LIMIT 5;