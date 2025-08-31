-- Setup storage bucket for listing photos
-- Run this in your Supabase SQL Editor

-- Create storage bucket for listing photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-photos', 'listing-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Public can view listing photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload listing photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own listing photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own listing photos" ON storage.objects;

-- Set up storage policies to allow public access
CREATE POLICY "Public can view listing photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-photos');

CREATE POLICY "Authenticated users can upload listing photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'listing-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own listing photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'listing-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own listing photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'listing-photos' AND auth.role() = 'authenticated');

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE 'Storage bucket listing-photos created and configured!'; 
    RAISE NOTICE 'Users can now upload photos for their listings';
END $$;
