-- VERIFY LISTINGS TABLE COMPATIBILITY
-- Check if our table structure matches what the app expects

-- Expected columns based on createListing function:
-- id (TEXT), title, description, price, category, location, condition, 
-- currency, status, images, image_url, seller_id, created_at, updated_at

-- Check if all required columns exist
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'id' AND data_type = 'text')
        THEN '✅ id (TEXT)' 
        ELSE '❌ id missing or wrong type' 
    END as id_check,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'title')
        THEN '✅ title' 
        ELSE '❌ title missing' 
    END as title_check,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'seller_id')
        THEN '✅ seller_id' 
        ELSE '❌ seller_id missing' 
    END as seller_id_check,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'images')
        THEN '✅ images' 
        ELSE '❌ images missing' 
    END as images_check,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'image_url')
        THEN '✅ image_url' 
        ELSE '❌ image_url missing' 
    END as image_url_check;

-- Show actual table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'listings'
ORDER BY ordinal_position;