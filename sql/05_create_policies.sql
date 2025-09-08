-- STEP 5: CREATE RLS POLICIES
CREATE POLICY "Users can read all ratings" ON public.ratings
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own ratings" ON public.ratings
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update own ratings" ON public.ratings
    FOR UPDATE USING (auth.uid() = reviewer_id)
    WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete own ratings" ON public.ratings
    FOR DELETE USING (auth.uid() = reviewer_id);

CREATE POLICY "Everyone can read rating stats" ON public.user_rating_stats
    FOR SELECT USING (true);
