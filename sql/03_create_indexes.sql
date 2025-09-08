-- STEP 3: CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_ratings_reviewed_user ON public.ratings(reviewed_user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_reviewer ON public.ratings(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_ratings_listing ON public.ratings(listing_id);
CREATE INDEX IF NOT EXISTS idx_ratings_transaction_type ON public.ratings(transaction_type);
CREATE INDEX IF NOT EXISTS idx_ratings_rating ON public.ratings(rating);
CREATE INDEX IF NOT EXISTS idx_ratings_created_at ON public.ratings(created_at);
