-- Fix for PGRST200 Relationship Error
-- Run this script in your Supabase SQL Editor to fix the bids-profiles relationship

-- Step 1: Add the missing foreign key constraint to make PostgREST understand the relationship
-- Drop the constraint first in case it already exists
ALTER TABLE public.bids DROP CONSTRAINT IF EXISTS fk_bids_bidder_profile;

-- Add the foreign key constraint that references profiles table
-- This tells PostgREST how to join bids and profiles tables
ALTER TABLE public.bids 
ADD CONSTRAINT fk_bids_bidder_profile 
FOREIGN KEY (bidder_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Step 2: Ensure all existing users have profiles
-- Insert profiles for any auth.users that don't have profiles yet
INSERT INTO public.profiles (id, display_name)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'display_name', 'Kullanıcı')
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE 'Bids-Profiles relationship fixed! The PGRST200 error should be resolved.'; 
END $$;
