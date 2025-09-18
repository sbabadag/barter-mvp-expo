-- CHECK LISTINGS TABLE STRUCTURE
-- This will show us the current structure after our changes

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'listings'
ORDER BY ordinal_position;