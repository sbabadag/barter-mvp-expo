-- Image optimization schema updates
-- Add support for multiple image sizes and metadata

-- Add new columns to listings table for optimized images
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS medium_url TEXT,
ADD COLUMN IF NOT EXISTS full_url TEXT,
ADD COLUMN IF NOT EXISTS image_metadata JSONB DEFAULT '{}';

-- Update the image_metadata column to store image information
-- Structure: {
--   "original": {"width": 1920, "height": 1080, "size": 2048000},
--   "thumbnail": {"width": 150, "height": 150, "size": 15000},
--   "medium": {"width": 400, "height": 400, "size": 80000},
--   "full": {"width": 800, "height": 800, "size": 200000},
--   "compression_ratio": 90,
--   "optimized_at": "2024-01-01T00:00:00Z"
-- }

-- Create index for better performance on image metadata queries
CREATE INDEX IF NOT EXISTS idx_listings_image_metadata ON public.listings USING GIN (image_metadata);

-- Add index for thumbnail_url for faster thumbnail loading
CREATE INDEX IF NOT EXISTS idx_listings_thumbnail_url ON public.listings(thumbnail_url) WHERE thumbnail_url IS NOT NULL;

-- Add index for medium_url for feed displays  
CREATE INDEX IF NOT EXISTS idx_listings_medium_url ON public.listings(medium_url) WHERE medium_url IS NOT NULL;

-- Add index for full_url for detail views
CREATE INDEX IF NOT EXISTS idx_listings_full_url ON public.listings(full_url) WHERE full_url IS NOT NULL;

-- Add profile image optimization support to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS avatar_metadata JSONB DEFAULT '{}';

-- Create index for profile avatar thumbnail
CREATE INDEX IF NOT EXISTS idx_profiles_avatar_thumbnail ON public.profiles(avatar_thumbnail_url) WHERE avatar_thumbnail_url IS NOT NULL;

-- Create a function to update the updated_at timestamp when image data changes
CREATE OR REPLACE FUNCTION update_image_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update timestamp if image-related fields changed
  IF (OLD.image_url IS DISTINCT FROM NEW.image_url OR
      OLD.thumbnail_url IS DISTINCT FROM NEW.thumbnail_url OR
      OLD.medium_url IS DISTINCT FROM NEW.medium_url OR
      OLD.full_url IS DISTINCT FROM NEW.full_url OR
      OLD.image_metadata IS DISTINCT FROM NEW.image_metadata) THEN
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for listings table
DROP TRIGGER IF EXISTS trigger_update_image_timestamp ON public.listings;
CREATE TRIGGER trigger_update_image_timestamp
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION update_image_timestamp();

-- Add comments for documentation
COMMENT ON COLUMN public.listings.thumbnail_url IS 'Optimized thumbnail image URL (150x150, quality 0.6)';
COMMENT ON COLUMN public.listings.medium_url IS 'Optimized medium image URL (400x400, quality 0.8)';
COMMENT ON COLUMN public.listings.full_url IS 'Optimized full image URL (800x800, quality 0.9)';
COMMENT ON COLUMN public.listings.image_metadata IS 'JSON metadata about image optimization (dimensions, sizes, compression ratio)';
COMMENT ON COLUMN public.profiles.avatar_thumbnail_url IS 'Optimized profile thumbnail URL (200x200, quality 0.8)';
COMMENT ON COLUMN public.profiles.avatar_metadata IS 'JSON metadata about profile image optimization';