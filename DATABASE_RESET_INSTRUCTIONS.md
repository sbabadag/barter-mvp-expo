# Database Reset Instructions

The app is still showing 69+ listings because Row Level Security (RLS) policies are preventing API-based deletion without proper authentication.

## Solution: Use Supabase Dashboard SQL Editor

1. **Open your Supabase dashboard** at https://supabase.com/dashboard

2. **Go to the SQL Editor** (left sidebar)

3. **Run this SQL query** to completely clear all listing data:

```sql
-- COMPLETE DATABASE RESET
-- This will delete ALL listings, bids, and comments

-- Step 1: Clear child tables first (to avoid foreign key constraints)
DELETE FROM bids;
DELETE FROM comments;

-- Step 2: Clear main listings table
DELETE FROM listings;

-- Step 3: Verify the reset
SELECT 
  'listings' as table_name, 
  COUNT(*) as remaining_records 
FROM listings
UNION ALL
SELECT 
  'bids' as table_name, 
  COUNT(*) as remaining_records 
FROM bids
UNION ALL
SELECT 
  'comments' as table_name, 
  COUNT(*) as remaining_records 
FROM comments;
```

4. **Execute the query** - Click the "Run" button

5. **Verify the results** - All counts should show 0

## After Running the SQL

1. **Restart your Expo app** to clear any cached data
2. **Hard refresh** the app (press 'r' in Expo CLI)
3. **Check the app** - it should now show empty state

## Why This Happened

- Your database has Row Level Security (RLS) enabled
- RLS policies require user authentication for data operations
- Our API scripts couldn't delete data without being signed in
- The Supabase dashboard runs with service role privileges, bypassing RLS

## Alternative (If SQL doesn't work)

If the SQL approach doesn't work, you can temporarily disable RLS:

```sql
-- Disable RLS temporarily
ALTER TABLE listings DISABLE ROW LEVEL SECURITY;
ALTER TABLE bids DISABLE ROW LEVEL SECURITY;  
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;

-- Delete all data
DELETE FROM bids;
DELETE FROM comments;
DELETE FROM listings;

-- Re-enable RLS
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
```

Let me know once you've run the SQL and I'll help verify the reset worked!