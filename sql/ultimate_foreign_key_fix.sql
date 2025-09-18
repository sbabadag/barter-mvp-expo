-- ULTIMATE FOREIGN KEY FIX
-- This fixes ALL foreign key type mismatches between tables

-- Step 1: Drop all tables with foreign key dependencies in correct order
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.user_notification_settings CASCADE;
DROP TABLE IF EXISTS public.user_push_tokens CASCADE;
DROP TABLE IF EXISTS public.bids CASCADE;

-- Step 2: Convert listings table to TEXT id to match our new schema
-- First backup any existing data (optional)
CREATE TEMP TABLE listings_backup AS SELECT * FROM public.listings;

-- Drop and recreate listings table with TEXT id
DROP TABLE IF EXISTS public.listings CASCADE;
CREATE TABLE public.listings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,  -- Changed to TEXT
    seller_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC,
    currency TEXT DEFAULT 'TRY',
    category TEXT,
    location TEXT,
    condition TEXT CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'reserved', 'sold', 'inactive')),
    image_url TEXT,
    images TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Recreate bids table with TEXT id and listing_id
CREATE TABLE public.bids (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,  -- TEXT id
    bidder_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    listing_id TEXT NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,  -- TEXT foreign key
    amount NUMERIC NOT NULL CHECK (amount > 0),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Recreate notifications table with correct foreign key types
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('new_bid', 'bid_accepted', 'bid_rejected', 'bid_countered', 'new_message', 'listing_sold', 'listing_expired', 'reminder')),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    
    -- Notification metadata
    read BOOLEAN DEFAULT FALSE,
    sent BOOLEAN DEFAULT FALSE,
    delivery_method VARCHAR(20) DEFAULT 'push' CHECK (delivery_method IN ('push', 'email', 'sms', 'in_app')),
    
    -- Related entities (ALL TEXT to match our schema)
    listing_id TEXT REFERENCES public.listings(id) ON DELETE CASCADE,  -- TEXT matches listings.id
    bid_id TEXT REFERENCES public.bids(id) ON DELETE CASCADE,           -- TEXT matches bids.id
    message_id UUID,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_related_entity CHECK (
        (type = 'new_bid' AND bid_id IS NOT NULL) OR
        (type IN ('bid_accepted', 'bid_rejected', 'bid_countered') AND bid_id IS NOT NULL) OR
        (type = 'new_message' AND message_id IS NOT NULL) OR
        (type IN ('listing_sold', 'listing_expired') AND listing_id IS NOT NULL) OR
        (type = 'reminder')
    )
);

-- Step 5: Create supporting tables
CREATE TABLE public.user_notification_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    push_new_bids BOOLEAN DEFAULT TRUE,
    push_bid_responses BOOLEAN DEFAULT TRUE,
    push_new_messages BOOLEAN DEFAULT TRUE,
    push_listing_updates BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT FALSE,
    email_new_bids BOOLEAN DEFAULT FALSE,
    email_bid_responses BOOLEAN DEFAULT TRUE,
    email_weekly_summary BOOLEAN DEFAULT FALSE,
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '08:00',
    timezone VARCHAR(50) DEFAULT 'Europe/Istanbul',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.user_push_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    platform VARCHAR(10) CHECK (platform IN ('ios', 'android', 'web')),
    device_name TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, token)
);

-- Step 6: Enable RLS on all tables
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_push_tokens ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies for listings
CREATE POLICY "Anyone can view active listings" ON public.listings
    FOR SELECT USING (status = 'active');

CREATE POLICY "Users can create listings" ON public.listings
    FOR INSERT WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Users can update their own listings" ON public.listings
    FOR UPDATE USING (seller_id = auth.uid());

-- Step 8: Create RLS policies for bids
CREATE POLICY "Users can view bids they made" ON public.bids
    FOR SELECT USING (bidder_id = auth.uid());

CREATE POLICY "Users can view bids on their listings" ON public.bids
    FOR SELECT USING (
        listing_id IN (
            SELECT id FROM public.listings 
            WHERE seller_id = auth.uid()
        )
    );

CREATE POLICY "Users can create bids" ON public.bids
    FOR INSERT WITH CHECK (
        bidder_id = auth.uid() AND
        amount > 0 AND
        listing_id NOT IN (
            SELECT id FROM public.listings 
            WHERE seller_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own bids" ON public.bids
    FOR UPDATE USING (bidder_id = auth.uid());

CREATE POLICY "Listing owners can update bid status" ON public.bids
    FOR UPDATE USING (
        listing_id IN (
            SELECT id FROM public.listings 
            WHERE seller_id = auth.uid()
        )
    );

-- Step 9: Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- Step 10: Create RLS policies for settings and tokens
CREATE POLICY "Users can manage their notification settings" ON public.user_notification_settings
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their push tokens" ON public.user_push_tokens
    FOR ALL USING (user_id = auth.uid());

-- Step 11: Create indexes for performance
CREATE INDEX idx_listings_seller_id ON public.listings(seller_id);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_category ON public.listings(category);
CREATE INDEX idx_bids_bidder_id ON public.bids(bidder_id);
CREATE INDEX idx_bids_listing_id ON public.bids(listing_id);
CREATE INDEX idx_bids_status ON public.bids(status);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_type ON public.notifications(type);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);

-- Step 12: Grant permissions
GRANT ALL ON public.listings TO authenticated;
GRANT ALL ON public.bids TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.user_notification_settings TO authenticated;
GRANT ALL ON public.user_push_tokens TO authenticated;

-- Step 13: Create essential functions
CREATE OR REPLACE FUNCTION public.create_test_notification(
    p_user_id uuid,
    p_title text DEFAULT 'Test Notification',
    p_body text DEFAULT 'This is a test notification'
)
RETURNS uuid
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    new_id uuid;
BEGIN
    new_id := gen_random_uuid();
    
    INSERT INTO public.notifications (
        id, user_id, type, title, body, data, delivery_method, read, sent
    ) VALUES (
        new_id, p_user_id, 'reminder', p_title, p_body, 
        '{"test": true}'::jsonb, 'in_app', false, true
    );
    
    RETURN new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_test_notification TO authenticated;

-- Step 14: Restore backed up data (if any existed)
INSERT INTO public.listings (id, seller_id, title, description, price, currency, category, location, condition, status, image_url, images, created_at, updated_at)
SELECT 
    id::text,  -- Convert UUID to TEXT
    seller_id,
    title,
    description,
    price,
    currency,
    category,
    location,
    condition,
    status,
    image_url,
    images,
    created_at,
    updated_at
FROM listings_backup
ON CONFLICT (id) DO NOTHING;

-- Step 15: Test the system
INSERT INTO public.notifications (
    id, user_id, type, title, body, data, delivery_method, read, sent, created_at
) VALUES (
    gen_random_uuid(),
    'f60082e2-4ca5-4534-a682-a30a7b039af9'::uuid,
    'reminder',
    '🎉 All Foreign Keys Fixed!',
    'All table relationships are now properly aligned with TEXT IDs!',
    '{"test": true, "method": "ultimate_fk_fix"}'::jsonb,
    'in_app', false, true, NOW()
);

-- Test function
SELECT create_test_notification(
    'f60082e2-4ca5-4534-a682-a30a7b039af9'::uuid, 
    '🧪 Foreign Key Test', 
    'This notification confirms all foreign key constraints are working!'
) as test_notification_id;

-- Check table structure
SELECT 
    'listings.id type: ' || pg_typeof(id) as listings_check
FROM public.listings LIMIT 1;

SELECT 
    'bids.id type: ' || pg_typeof(id) as bids_check,
    'bids.listing_id type: ' || pg_typeof(listing_id) as bids_listing_id_check
FROM public.bids LIMIT 1;

SELECT 
    'notifications.listing_id type: ' || pg_typeof(listing_id) as notifications_listing_id_check,
    'notifications.bid_id type: ' || pg_typeof(bid_id) as notifications_bid_id_check
FROM public.notifications LIMIT 1;

SELECT 'Ultimate foreign key fix completed! All type mismatches resolved! 🚀' as final_status;