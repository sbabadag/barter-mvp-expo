-- Check if ratings table exists and see its structure
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'ratings'
ORDER BY ordinal_position;

-- Also check if the table exists at all
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('ratings', 'user_rating_stats');
