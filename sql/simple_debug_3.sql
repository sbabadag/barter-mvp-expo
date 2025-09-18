-- Query 3: Test current user context
SELECT 
    auth.uid() as current_user_id,
    CASE 
        WHEN auth.uid() = 'f60082e2-4ca5-4534-a682-a30a7b039af9'::uuid 
        THEN 'User ID matches ✅' 
        ELSE 'User ID mismatch ❌' 
    END as user_match_status;