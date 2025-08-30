-- Fix RLS policies for profiles table to allow user registration
-- This fixes the "new row violates row-level security policy" error

-- Drop existing policies
DROP POLICY IF EXISTS "users can read/write their profile" ON profiles;
DROP POLICY IF EXISTS "public can read profiles" ON profiles;
DROP POLICY IF EXISTS "users can create their own profile" ON profiles;

-- Recreate policies with proper permissions
-- 1. Allow authenticated users to create their own profile (for registration)
CREATE POLICY "users can create their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- 2. Allow users to read and update their own profile
CREATE POLICY "users can read/write their profile"
ON profiles FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Allow public read of profiles for marketplace features (display names, etc.)
CREATE POLICY "public can read profiles"
ON profiles FOR SELECT
USING (true);
