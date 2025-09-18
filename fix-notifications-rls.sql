-- Check and fix notifications table RLS policies
-- Run this in Supabase SQL Editor

-- Check current RLS status for notifications
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'notifications';

-- Check existing policies for notifications
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'notifications';

-- Enable RLS for notifications if not already enabled
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "public_insert_notifications" ON notifications;
DROP POLICY IF EXISTS "public_select_notifications" ON notifications;
DROP POLICY IF EXISTS "public_update_notifications" ON notifications;

-- Create public INSERT policy for notifications
CREATE POLICY "public_insert_notifications" 
ON notifications FOR INSERT 
TO public 
WITH CHECK (true);

-- Create public SELECT policy for notifications
CREATE POLICY "public_select_notifications" 
ON notifications FOR SELECT 
TO public 
USING (true);

-- Create public UPDATE policy for notifications (for marking as read)
CREATE POLICY "public_update_notifications" 
ON notifications FOR UPDATE 
TO public 
USING (true);

-- Verify notifications policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'notifications';