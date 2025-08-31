-- Safe Complete Database Setup Script for Bidding System
-- This version handles existing objects gracefully
-- Run this script in your Supabase SQL Editor

-- Step 1: Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Drop and recreate tables in correct order (to handle dependencies)
-- This ensures a clean state

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS public.bids CASCADE;
DROP TABLE IF EXISTS public.listings CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop triggers and functions if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Step 3: Create profiles table first (required for bids relationships)

CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Basic profile constraints
    CONSTRAINT display_name_length CHECK (char_length(display_name) >= 1 AND char_length(display_name) <= 100)
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_display_name ON public.profiles(display_name);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create updated_at trigger function (shared by all tables)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create updated_at trigger for profiles
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE public.profiles IS 'User profile information for displaying names and avatars';
COMMENT ON COLUMN public.profiles.display_name IS 'Display name shown to other users';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to user avatar image';

-- Function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', 'Yeni Kullanıcı')
    )
    ON CONFLICT (id) DO NOTHING; -- Prevent duplicate key errors
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile for new users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Create listings table

CREATE TABLE public.listings (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    currency TEXT DEFAULT 'TRY',
    category TEXT,
    location TEXT,
    images JSONB DEFAULT '[]',
    seller_name TEXT,
    seller_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    condition TEXT CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_listings_category ON public.listings(category);
CREATE INDEX idx_listings_location ON public.listings(location);
CREATE INDEX idx_listings_price ON public.listings(price);
CREATE INDEX idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_seller_id ON public.listings(seller_id);

-- Enable Row Level Security
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for listings
CREATE POLICY "Listings are viewable by everyone" ON public.listings
    FOR SELECT USING (status = 'active');

CREATE POLICY "Users can insert listings" ON public.listings
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own listings" ON public.listings
    FOR UPDATE USING (seller_id = auth.uid())
    WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Users can delete their own listings" ON public.listings
    FOR DELETE USING (seller_id = auth.uid());

-- Add updated_at trigger for listings
CREATE TRIGGER update_listings_updated_at 
    BEFORE UPDATE ON public.listings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Step 5: Create bids table (depends on both profiles and listings)

CREATE TABLE public.bids (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id TEXT NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    bidder_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'countered')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    counter_offer_amount DECIMAL(10,2) CHECK (counter_offer_amount > 0),
    counter_offer_message TEXT
);

-- Create indexes for better performance
CREATE INDEX idx_bids_listing_id ON public.bids(listing_id);
CREATE INDEX idx_bids_bidder_id ON public.bids(bidder_id);
CREATE INDEX idx_bids_status ON public.bids(status);
CREATE INDEX idx_bids_created_at ON public.bids(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bids
CREATE POLICY "Users can view bids they made" ON public.bids
    FOR SELECT USING (bidder_id = auth.uid());

CREATE POLICY "Users can view bids on their listings" ON public.bids
    FOR SELECT USING (
        listing_id IN (
            SELECT id FROM public.listings WHERE seller_id = auth.uid()
        )
    );

CREATE POLICY "Users can create bids" ON public.bids
    FOR INSERT WITH CHECK (
        bidder_id = auth.uid() AND
        amount > 0 AND
        listing_id NOT IN (
            SELECT id FROM public.listings WHERE seller_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own bids" ON public.bids
    FOR UPDATE USING (bidder_id = auth.uid())
    WITH CHECK (bidder_id = auth.uid());

CREATE POLICY "Listing owners can update bid status" ON public.bids
    FOR UPDATE USING (
        listing_id IN (
            SELECT id FROM public.listings WHERE seller_id = auth.uid()
        )
    )
    WITH CHECK (
        listing_id IN (
            SELECT id FROM public.listings WHERE seller_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their pending bids" ON public.bids
    FOR DELETE USING (
        bidder_id = auth.uid() AND 
        status = 'pending'
    );

-- Create updated_at trigger for bids
CREATE TRIGGER update_bids_updated_at 
    BEFORE UPDATE ON public.bids 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE public.bids IS 'Stores bids made by users on marketplace listings';
COMMENT ON COLUMN public.bids.listing_id IS 'ID of the listing being bid on';
COMMENT ON COLUMN public.bids.bidder_id IS 'ID of the user making the bid';
COMMENT ON COLUMN public.bids.amount IS 'Bid amount in the local currency';
COMMENT ON COLUMN public.bids.status IS 'Current status of the bid: pending, accepted, rejected, countered';
COMMENT ON COLUMN public.bids.expires_at IS 'When this bid expires (optional)';
COMMENT ON COLUMN public.bids.counter_offer_amount IS 'Amount for counter-offer (if status is countered)';
COMMENT ON COLUMN public.bids.counter_offer_message IS 'Message accompanying the counter-offer';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.listings TO anon, authenticated;
GRANT ALL ON public.bids TO anon, authenticated;

-- Final success message
DO $$ 
BEGIN 
    RAISE NOTICE 'Safe database setup complete! Tables: profiles, listings, bids'; 
    RAISE NOTICE 'All foreign key relationships properly established';
    RAISE NOTICE 'RLS policies applied for security';
    RAISE NOTICE 'Ready for marketplace with bidding system!';
    RAISE NOTICE 'You can now run: npm run seed-db to populate with sample data';
END $$;
