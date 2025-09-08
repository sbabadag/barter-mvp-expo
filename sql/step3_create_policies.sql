-- Step 3: Enable RLS and create policies (run this after step 2)

-- Enable RLS
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rating_stats ENABLE ROW LEVEL SECURITY;

-- Rating policies
CREATE POLICY "Users can read all ratings" ON public.ratings
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own ratings" ON public.ratings
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update own ratings" ON public.ratings
    FOR UPDATE USING (auth.uid() = reviewer_id)
    WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete own ratings" ON public.ratings
    FOR DELETE USING (auth.uid() = reviewer_id);

-- Rating stats policies
CREATE POLICY "Everyone can read rating stats" ON public.user_rating_stats
    FOR SELECT USING (true);

-- Allow the system to insert/update stats (for triggers)
CREATE POLICY "System updates rating stats" ON public.user_rating_stats
    FOR ALL USING (true) WITH CHECK (true);

SELECT 'Step 3 completed: RLS and policies created' as result;
