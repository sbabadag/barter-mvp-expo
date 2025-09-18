-- Query 4: Test the exact query the app uses
SELECT 
    id,
    user_id,
    type,
    title,
    body,
    read,
    created_at
FROM public.notifications 
WHERE user_id = auth.uid()
ORDER BY created_at DESC;