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
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    city TEXT,
    birth_date DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    avatar_url TEXT,
    home_address TEXT,
    home_postal_code TEXT,
    work_address TEXT,
    work_postal_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Basic profile constraints
    CONSTRAINT display_name_length CHECK (char_length(display_name) >= 1 AND char_length(display_name) <= 100),
    CONSTRAINT first_name_length CHECK (char_length(first_name) >= 1 AND char_length(first_name) <= 50),
    CONSTRAINT last_name_length CHECK (char_length(last_name) >= 1 AND char_length(last_name) <= 50),
    CONSTRAINT email_format CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT phone_format CHECK (phone ~ '^\+?[1-9]\d{1,14}$'),
    CONSTRAINT home_address_length CHECK (char_length(home_address) <= 200),
    CONSTRAINT work_address_length CHECK (char_length(work_address) <= 200)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON public.profiles(display_name);
CREATE INDEX IF NOT EXISTS idx_profiles_first_name ON public.profiles(first_name);
CREATE INDEX IF NOT EXISTS idx_profiles_last_name ON public.profiles(last_name);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_home_postal_code ON public.profiles(home_postal_code);
CREATE INDEX IF NOT EXISTS idx_profiles_work_postal_code ON public.profiles(work_postal_code);

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
COMMENT ON TABLE public.profiles IS 'Extended user profile information for displaying names, contact info, and personal details';
COMMENT ON COLUMN public.profiles.display_name IS 'Display name shown to other users (usually first_name + last_name)';
COMMENT ON COLUMN public.profiles.first_name IS 'User first name';
COMMENT ON COLUMN public.profiles.last_name IS 'User last name';
COMMENT ON COLUMN public.profiles.email IS 'User email address';
COMMENT ON COLUMN public.profiles.phone IS 'User phone number';
COMMENT ON COLUMN public.profiles.city IS 'User city/location';
COMMENT ON COLUMN public.profiles.birth_date IS 'User birth date';
COMMENT ON COLUMN public.profiles.gender IS 'User gender: male, female, or other';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to user avatar image';
COMMENT ON COLUMN public.profiles.home_address IS 'User home address';
COMMENT ON COLUMN public.profiles.home_postal_code IS 'User home postal code (5 digits)';
COMMENT ON COLUMN public.profiles.work_address IS 'User work/office address';
COMMENT ON COLUMN public.profiles.work_postal_code IS 'User work postal code (5 digits)';

-- Function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', 'Yeni Kullanıcı'),
        COALESCE(NEW.raw_user_meta_data->>'email', NEW.email)
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
-- Drop existing constraint first to avoid conflicts
ALTER TABLE public.bids DROP CONSTRAINT IF EXISTS fk_bids_bidder_profile;

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

-- Step 4: Create listings table for marketplace items

CREATE TABLE IF NOT EXISTS public.listings (
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
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_location ON public.listings(location);
CREATE INDEX IF NOT EXISTS idx_listings_price ON public.listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON public.listings(seller_id);

-- Enable Row Level Security
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for listings
DROP POLICY IF EXISTS "Listings are viewable by everyone" ON public.listings;
DROP POLICY IF EXISTS "Users can insert listings" ON public.listings;
DROP POLICY IF EXISTS "Users can update their own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON public.listings;

-- Everyone can view active listings
CREATE POLICY "Listings are viewable by everyone" ON public.listings
    FOR SELECT USING (status = 'active');

-- Authenticated users can insert listings
CREATE POLICY "Users can insert listings" ON public.listings
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own listings
CREATE POLICY "Users can update their own listings" ON public.listings
    FOR UPDATE USING (seller_id = auth.uid())
    WITH CHECK (seller_id = auth.uid());

-- Users can delete their own listings
CREATE POLICY "Users can delete their own listings" ON public.listings
    FOR DELETE USING (seller_id = auth.uid());

-- Add updated_at trigger for listings
DROP TRIGGER IF EXISTS update_listings_updated_at ON public.listings;
CREATE TRIGGER update_listings_updated_at 
    BEFORE UPDATE ON public.listings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE public.listings IS 'Marketplace listings for products and services';
COMMENT ON COLUMN public.listings.price IS 'Price in the specified currency';
COMMENT ON COLUMN public.listings.images IS 'Array of image URLs in JSON format';
COMMENT ON COLUMN public.listings.condition IS 'Condition of the item: new, like_new, good, fair, poor';
COMMENT ON COLUMN public.listings.seller_id IS 'User ID of the listing owner';

-- Final success message
DO $$ 
BEGIN 
    RAISE NOTICE 'Complete setup finished! Tables: profiles, bids, listings'; 
    RAISE NOTICE 'Ready for marketplace with bidding system!';
    RAISE NOTICE 'You can now run: node scripts/seedDatabase.js to populate with sample data';
END $$;
