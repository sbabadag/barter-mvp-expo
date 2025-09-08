-- RATING & REVIEW SYSTEM FOR İMECE MARKETPLACE
-- This script adds rating and review functionality to the existing database

-- =============================================================================
-- STEP 1: CREATE RATINGS TABLE
-- =============================================================================

-- Table to store individual ratings/reviews
CREATE TABLE IF NOT EXISTS public.ratings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Who is rating whom
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reviewed_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- What transaction this relates to
    listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
    transaction_type VARCHAR(20) CHECK (transaction_type IN ('buyer', 'seller')) NOT NULL,
    
    -- Rating details
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    review_text TEXT,
    
    -- Categories for detailed feedback
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    item_condition_rating INTEGER CHECK (item_condition_rating >= 1 AND item_condition_rating <= 5),
    delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
    
    -- Metadata
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE, -- If the transaction was verified completed
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(reviewer_id, reviewed_user_id, listing_id), -- Prevent duplicate reviews for same transaction
    CHECK (reviewer_id != reviewed_user_id) -- Can't review yourself
);

-- =============================================================================
-- STEP 2: CREATE USER RATING SUMMARY TABLE
-- =============================================================================

-- Table to store aggregated rating statistics for quick lookup
CREATE TABLE IF NOT EXISTS public.user_rating_stats (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Overall ratings
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    
    -- As seller
    seller_average_rating DECIMAL(3,2) DEFAULT 0.00,
    seller_total_reviews INTEGER DEFAULT 0,
    seller_5_star INTEGER DEFAULT 0,
    seller_4_star INTEGER DEFAULT 0,
    seller_3_star INTEGER DEFAULT 0,
    seller_2_star INTEGER DEFAULT 0,
    seller_1_star INTEGER DEFAULT 0,
    
    -- As buyer
    buyer_average_rating DECIMAL(3,2) DEFAULT 0.00,
    buyer_total_reviews INTEGER DEFAULT 0,
    buyer_5_star INTEGER DEFAULT 0,
    buyer_4_star INTEGER DEFAULT 0,
    buyer_3_star INTEGER DEFAULT 0,
    buyer_2_star INTEGER DEFAULT 0,
    buyer_1_star INTEGER DEFAULT 0,
    
    -- Detailed averages
    avg_communication DECIMAL(3,2) DEFAULT 0.00,
    avg_item_condition DECIMAL(3,2) DEFAULT 0.00,
    avg_delivery DECIMAL(3,2) DEFAULT 0.00,
    
    -- Timestamps
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ratings_reviewed_user ON public.ratings(reviewed_user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_reviewer ON public.ratings(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_ratings_listing ON public.ratings(listing_id);
CREATE INDEX IF NOT EXISTS idx_ratings_transaction_type ON public.ratings(transaction_type);
CREATE INDEX IF NOT EXISTS idx_ratings_rating ON public.ratings(rating);
CREATE INDEX IF NOT EXISTS idx_ratings_created_at ON public.ratings(created_at);

-- =============================================================================
-- STEP 4: CREATE RATING UPDATE FUNCTION
-- =============================================================================

-- Function to update user rating statistics
CREATE OR REPLACE FUNCTION update_user_rating_stats(target_user_id UUID)
RETURNS VOID AS $$
DECLARE
    seller_stats RECORD;
    buyer_stats RECORD;
BEGIN
    -- Calculate seller statistics
    SELECT 
        COALESCE(AVG(rating), 0)::DECIMAL(3,2) as avg_rating,
        COUNT(*)::INTEGER as total_reviews,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END)::INTEGER as five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END)::INTEGER as four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END)::INTEGER as three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END)::INTEGER as two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END)::INTEGER as one_star,
        COALESCE(AVG(communication_rating), 0)::DECIMAL(3,2) as avg_comm,
        COALESCE(AVG(item_condition_rating), 0)::DECIMAL(3,2) as avg_condition,
        COALESCE(AVG(delivery_rating), 0)::DECIMAL(3,2) as avg_delivery
    INTO seller_stats
    FROM public.ratings 
    WHERE reviewed_user_id = target_user_id AND transaction_type = 'seller';
    
    -- Calculate buyer statistics
    SELECT 
        COALESCE(AVG(rating), 0)::DECIMAL(3,2) as avg_rating,
        COUNT(*)::INTEGER as total_reviews,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END)::INTEGER as five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END)::INTEGER as four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END)::INTEGER as three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END)::INTEGER as two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END)::INTEGER as one_star
    INTO buyer_stats
    FROM public.ratings 
    WHERE reviewed_user_id = target_user_id AND transaction_type = 'buyer';
    
    -- Insert or update statistics
    INSERT INTO public.user_rating_stats (
        user_id,
        average_rating,
        total_reviews,
        seller_average_rating,
        seller_total_reviews,
        seller_5_star,
        seller_4_star,
        seller_3_star,
        seller_2_star,
        seller_1_star,
        buyer_average_rating,
        buyer_total_reviews,
        buyer_5_star,
        buyer_4_star,
        buyer_3_star,
        buyer_2_star,
        buyer_1_star,
        avg_communication,
        avg_item_condition,
        avg_delivery,
        last_updated
    ) VALUES (
        target_user_id,
        COALESCE((seller_stats.avg_rating * seller_stats.total_reviews + buyer_stats.avg_rating * buyer_stats.total_reviews) / NULLIF(seller_stats.total_reviews + buyer_stats.total_reviews, 0), 0),
        seller_stats.total_reviews + buyer_stats.total_reviews,
        seller_stats.avg_rating,
        seller_stats.total_reviews,
        seller_stats.five_star,
        seller_stats.four_star,
        seller_stats.three_star,
        seller_stats.two_star,
        seller_stats.one_star,
        buyer_stats.avg_rating,
        buyer_stats.total_reviews,
        buyer_stats.five_star,
        buyer_stats.four_star,
        buyer_stats.three_star,
        buyer_stats.two_star,
        buyer_stats.one_star,
        seller_stats.avg_comm,
        seller_stats.avg_condition,
        seller_stats.avg_delivery,
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        average_rating = EXCLUDED.average_rating,
        total_reviews = EXCLUDED.total_reviews,
        seller_average_rating = EXCLUDED.seller_average_rating,
        seller_total_reviews = EXCLUDED.seller_total_reviews,
        seller_5_star = EXCLUDED.seller_5_star,
        seller_4_star = EXCLUDED.seller_4_star,
        seller_3_star = EXCLUDED.seller_3_star,
        seller_2_star = EXCLUDED.seller_2_star,
        seller_1_star = EXCLUDED.seller_1_star,
        buyer_average_rating = EXCLUDED.buyer_average_rating,
        buyer_total_reviews = EXCLUDED.buyer_total_reviews,
        buyer_5_star = EXCLUDED.buyer_5_star,
        buyer_4_star = EXCLUDED.buyer_4_star,
        buyer_3_star = EXCLUDED.buyer_3_star,
        buyer_2_star = EXCLUDED.buyer_2_star,
        buyer_1_star = EXCLUDED.buyer_1_star,
        avg_communication = EXCLUDED.avg_communication,
        avg_item_condition = EXCLUDED.avg_item_condition,
        avg_delivery = EXCLUDED.avg_delivery,
        last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- STEP 5: CREATE TRIGGERS
-- =============================================================================

-- Trigger to automatically update rating stats when a new rating is added/updated
CREATE OR REPLACE FUNCTION trigger_update_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update stats for the reviewed user
    PERFORM update_user_rating_stats(COALESCE(NEW.reviewed_user_id, OLD.reviewed_user_id));
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS ratings_update_stats ON public.ratings;

-- Create trigger
CREATE TRIGGER ratings_update_stats
    AFTER INSERT OR UPDATE OR DELETE ON public.ratings
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_rating_stats();

-- =============================================================================
-- STEP 6: ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on ratings table
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rating_stats ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all ratings
CREATE POLICY "Users can read all ratings" ON public.ratings
    FOR SELECT USING (true);

-- Policy: Users can only insert ratings for themselves as reviewer
CREATE POLICY "Users can insert own ratings" ON public.ratings
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Policy: Users can update their own ratings
CREATE POLICY "Users can update own ratings" ON public.ratings
    FOR UPDATE USING (auth.uid() = reviewer_id)
    WITH CHECK (auth.uid() = reviewer_id);

-- Policy: Users can delete their own ratings
CREATE POLICY "Users can delete own ratings" ON public.ratings
    FOR DELETE USING (auth.uid() = reviewer_id);

-- Policy: Everyone can read rating stats
CREATE POLICY "Everyone can read rating stats" ON public.user_rating_stats
    FOR SELECT USING (true);

-- Policy: Only system can modify rating stats (through triggers)
CREATE POLICY "System only updates rating stats" ON public.user_rating_stats
    FOR ALL USING (false) WITH CHECK (false);

-- =============================================================================
-- STEP 7: CREATE SAMPLE RATINGS DATA
-- =============================================================================

-- Add some sample ratings to test the system
INSERT INTO public.ratings (
    reviewer_id,
    reviewed_user_id, 
    listing_id,
    transaction_type,
    rating,
    review_text,
    communication_rating,
    item_condition_rating,
    delivery_rating,
    is_verified,
    created_at
) 
SELECT 
    bidder_id as reviewer_id,
    l.seller_id as reviewed_user_id,
    b.listing_id,
    'seller' as transaction_type,
    (CASE 
        WHEN random() < 0.4 THEN 5
        WHEN random() < 0.7 THEN 4
        WHEN random() < 0.9 THEN 3
        WHEN random() < 0.95 THEN 2
        ELSE 1
    END) as rating,
    (CASE 
        WHEN random() < 0.3 THEN 'Çok memnun kaldım, hızlı teslimat!'
        WHEN random() < 0.6 THEN 'Açıklandığı gibi, güvenilir satıcı.'
        WHEN random() < 0.8 THEN 'İyi bir alışveriş deneyimi.'
        ELSE 'Teşekkürler!'
    END) as review_text,
    (3 + (random() * 2)::INTEGER) as communication_rating,
    (3 + (random() * 2)::INTEGER) as item_condition_rating,
    (3 + (random() * 2)::INTEGER) as delivery_rating,
    true as is_verified,
    NOW() - (random() * INTERVAL '30 days') as created_at
FROM public.bids b
JOIN public.listings l ON b.listing_id = l.id
WHERE b.amount > 0 -- Only actual bids, not messages
AND random() < 0.6 -- 60% chance of having a rating
LIMIT 15;

-- Initialize rating stats for all users
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT id FROM auth.users LOOP
        PERFORM update_user_rating_stats(user_record.id);
    END LOOP;
END $$;

-- Display success message
SELECT '⭐ Rating & Review System başarıyla kuruldu!' as result;
SELECT 'Oluşturulan tablolar:' as info;
SELECT 
    (SELECT COUNT(*) FROM public.ratings) as total_ratings,
    (SELECT COUNT(*) FROM public.user_rating_stats) as users_with_stats;
