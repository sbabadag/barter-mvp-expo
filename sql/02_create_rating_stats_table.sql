-- STEP 2: CREATE USER RATING STATS TABLE
CREATE TABLE IF NOT EXISTS public.user_rating_stats (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    seller_average_rating DECIMAL(3,2) DEFAULT 0.00,
    seller_total_reviews INTEGER DEFAULT 0,
    seller_5_star INTEGER DEFAULT 0,
    seller_4_star INTEGER DEFAULT 0,
    seller_3_star INTEGER DEFAULT 0,
    seller_2_star INTEGER DEFAULT 0,
    seller_1_star INTEGER DEFAULT 0,
    buyer_average_rating DECIMAL(3,2) DEFAULT 0.00,
    buyer_total_reviews INTEGER DEFAULT 0,
    buyer_5_star INTEGER DEFAULT 0,
    buyer_4_star INTEGER DEFAULT 0,
    buyer_3_star INTEGER DEFAULT 0,
    buyer_2_star INTEGER DEFAULT 0,
    buyer_1_star INTEGER DEFAULT 0,
    avg_communication DECIMAL(3,2) DEFAULT 0.00,
    avg_item_condition DECIMAL(3,2) DEFAULT 0.00,
    avg_delivery DECIMAL(3,2) DEFAULT 0.00,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
