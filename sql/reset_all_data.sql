-- Complete database reset - Clear all listing-related data
-- Run this script in your Supabase SQL Editor

-- Step 1: Disable foreign key checks temporarily (if supported)
SET session_replication_role = replica;

-- Step 2: Clear all bids (child table first)
DELETE FROM bids;

-- Step 3: Clear all comments (child table)
DELETE FROM comments;

-- Step 4: Clear all ratings if table exists
DELETE FROM ratings;

-- Step 5: Clear all offers if table exists  
DELETE FROM offers;

-- Step 6: Clear all listings (parent table)
DELETE FROM listings;

-- Step 7: Re-enable foreign key checks
SET session_replication_role = DEFAULT;

-- Step 8: Verify the reset
SELECT 'listings' as table_name, COUNT(*) as remaining_records FROM listings
UNION ALL
SELECT 'bids' as table_name, COUNT(*) as remaining_records FROM bids
UNION ALL
SELECT 'comments' as table_name, COUNT(*) as remaining_records FROM comments;