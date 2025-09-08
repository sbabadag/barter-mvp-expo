-- SIMPLE RATING SYSTEM SETUP - RUN EACH STEP SEPARATELY
-- Step 1: Drop existing (run this first)

DO $$ 
BEGIN
    -- Drop triggers and functions first
    DROP TRIGGER IF EXISTS ratings_update_stats ON public.ratings;
    DROP FUNCTION IF EXISTS trigger_update_rating_stats();
    DROP FUNCTION IF EXISTS update_user_rating_stats(UUID);
    
    -- Drop policies if tables exist
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ratings') THEN
        DROP POLICY IF EXISTS "Users can read all ratings" ON public.ratings;
        DROP POLICY IF EXISTS "Users can insert own ratings" ON public.ratings;
        DROP POLICY IF EXISTS "Users can update own ratings" ON public.ratings;
        DROP POLICY IF EXISTS "Users can delete own ratings" ON public.ratings;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_rating_stats') THEN
        DROP POLICY IF EXISTS "Everyone can read rating stats" ON public.user_rating_stats;
        DROP POLICY IF EXISTS "System only updates rating stats" ON public.user_rating_stats;
    END IF;
    
    -- Drop tables
    DROP TABLE IF EXISTS public.user_rating_stats CASCADE;
    DROP TABLE IF EXISTS public.ratings CASCADE;
    
    RAISE NOTICE 'Step 1 completed: All existing rating system components dropped';
END $$;
