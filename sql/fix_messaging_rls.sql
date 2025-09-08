-- FIX RLS POLICIES FOR MESSAGING FUNCTIONALITY
-- This script fixes the bids table RLS policies to allow messaging

-- Drop the existing "Users can create bids" policy
DROP POLICY IF EXISTS "Users can create bids" ON public.bids;

-- Create new policy that allows messaging (amount can be 0) and allows bidding on own listings for messaging
CREATE POLICY "Users can create bids" ON public.bids
    FOR INSERT WITH CHECK (
        bidder_id = auth.uid() AND
        amount >= 0  -- Allow 0 amount for messages
        -- Removed the restriction on bidding on own listings to allow messaging
    );

-- Also ensure profiles can be read by all authenticated users for chat functionality
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles" ON public.profiles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Fix the amount check constraint to allow 0 amount for messages
ALTER TABLE public.bids DROP CONSTRAINT IF EXISTS bids_amount_check;
ALTER TABLE public.bids ADD CONSTRAINT bids_amount_check CHECK (amount >= 0);

-- Grant necessary permissions
GRANT SELECT ON public.profiles TO authenticated;
GRANT ALL ON public.bids TO authenticated;
GRANT ALL ON public.listings TO authenticated;
