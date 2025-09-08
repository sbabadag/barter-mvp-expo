-- Step 2: Create tables (run this after step 1)

CREATE TABLE public.ratings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reviewed_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('buyer', 'seller')),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    item_condition_rating INTEGER CHECK (item_condition_rating >= 1 AND item_condition_rating <= 5),
    delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(reviewer_id, reviewed_user_id, listing_id),
    CHECK (reviewer_id != reviewed_user_id)
);

CREATE TABLE public.user_rating_stats (
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

-- Create indexes
CREATE INDEX idx_ratings_reviewed_user ON public.ratings(reviewed_user_id);
CREATE INDEX idx_ratings_reviewer ON public.ratings(reviewer_id);
CREATE INDEX idx_ratings_listing ON public.ratings(listing_id);
CREATE INDEX idx_ratings_transaction_type ON public.ratings(transaction_type);
CREATE INDEX idx_ratings_rating ON public.ratings(rating);
CREATE INDEX idx_ratings_created_at ON public.ratings(created_at);

SELECT 'Step 2 completed: Tables and indexes created' as result;
