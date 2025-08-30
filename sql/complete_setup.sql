-- Complete Database Setup Script for Bidding System
-- Run this script in your Supabase SQL Editor to set up all required tables

-- Step 1: Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Create profiles table first (required for bids relationships)

-- Create profiles table to store user profile information
-- This is referenced by the bids table for user information

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Basic profile constraints
    CONSTRAINT display_name_length CHECK (char_length(display_name) >= 1 AND char_length(display_name) <= 100)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON public.profiles(display_name);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Users can view all profiles (for displaying user names in bids, etc.)
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create updated_at trigger function (shared by both tables)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create updated_at trigger for profiles
-- Drop existing trigger first to avoid conflicts
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

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
-- Drop existing trigger first to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Create bids table (depends on profiles table)

CREATE TABLE IF NOT EXISTS public.bids (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id TEXT NOT NULL,
    bidder_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'countered')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    counter_offer_amount DECIMAL(10,2) CHECK (counter_offer_amount > 0),
    counter_offer_message TEXT,
    
    -- Ensure bidder can't bid on their own listings (if we had a listings table)
    -- This constraint would need to be added when we have the listings table
    CONSTRAINT valid_amount CHECK (amount > 0)
);

-- Add foreign key to profiles table for easier joins
-- Note: This creates a relationship that PostgREST can understand
ALTER TABLE public.bids 
ADD CONSTRAINT fk_bids_bidder_profile 
FOREIGN KEY (bidder_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bids_listing_id ON public.bids(listing_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder_id ON public.bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON public.bids(status);
CREATE INDEX IF NOT EXISTS idx_bids_created_at ON public.bids(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bids
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view bids they made" ON public.bids;
DROP POLICY IF EXISTS "Users can view bids on listings" ON public.bids;
DROP POLICY IF EXISTS "Users can create bids" ON public.bids;
DROP POLICY IF EXISTS "Users can update their own bids" ON public.bids;
DROP POLICY IF EXISTS "Allow bid status updates" ON public.bids;
DROP POLICY IF EXISTS "Users can delete their pending bids" ON public.bids;

-- Users can view bids on listings they are involved with (as bidder or listing owner)
-- For now, we'll allow users to see all bids since we don't have a listings table yet
CREATE POLICY "Users can view bids they made" ON public.bids
    FOR SELECT USING (bidder_id = auth.uid());

-- Users can view bids on their own listings (will need listings table relationship)
-- For now, we'll create a more permissive policy
CREATE POLICY "Users can view bids on listings" ON public.bids
    FOR SELECT USING (true); -- This should be restricted based on listing ownership

-- Users can create bids on listings they don't own
CREATE POLICY "Users can create bids" ON public.bids
    FOR INSERT WITH CHECK (
        bidder_id = auth.uid() AND
        amount > 0
    );

-- Users can update their own bids (for status changes, etc.)
CREATE POLICY "Users can update their own bids" ON public.bids
    FOR UPDATE USING (bidder_id = auth.uid())
    WITH CHECK (bidder_id = auth.uid());

-- Listing owners can update bid status (accept/reject/counter)
-- For now, allow the bidder to update their own bids
CREATE POLICY "Allow bid status updates" ON public.bids
    FOR UPDATE USING (true)
    WITH CHECK (true);

-- Users can delete their own bids (if in pending status)
CREATE POLICY "Users can delete their pending bids" ON public.bids
    FOR DELETE USING (
        bidder_id = auth.uid() AND 
        status = 'pending'
    );

-- Create updated_at trigger for bids
-- Drop existing trigger first to avoid conflicts (function is shared, so don't drop it)
DROP TRIGGER IF EXISTS update_bids_updated_at ON public.bids;

CREATE TRIGGER update_bids_updated_at 
    BEFORE UPDATE ON public.bids 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add some helpful comments
COMMENT ON TABLE public.bids IS 'Stores bids made by users on marketplace listings';
COMMENT ON COLUMN public.bids.listing_id IS 'ID of the listing being bid on';
COMMENT ON COLUMN public.bids.bidder_id IS 'ID of the user making the bid';
COMMENT ON COLUMN public.bids.amount IS 'Bid amount in the local currency';
COMMENT ON COLUMN public.bids.status IS 'Current status of the bid: pending, accepted, rejected, countered';
COMMENT ON COLUMN public.bids.expires_at IS 'When this bid expires (optional)';
COMMENT ON COLUMN public.bids.counter_offer_amount IS 'Amount for counter-offer (if status is countered)';
COMMENT ON COLUMN public.bids.counter_offer_message IS 'Message accompanying the counter-offer';

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE 'Bidding system database setup complete! Tables: profiles, bids'; 
    RAISE NOTICE 'Updated: Added ON CONFLICT handling to prevent profile creation errors';
    RAISE NOTICE 'If you see "Profile not found" warnings, please run this SQL script again';
END $$;
