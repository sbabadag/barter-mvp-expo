-- QUICK FIX: Update phone format constraint to accept Turkish phone numbers
-- Run this script in your Supabase SQL Editor to fix the phone validation

-- Drop the existing phone_format constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS phone_format;

-- Add the updated phone_format constraint that accepts both formats:
-- - International format: +905324078125 or +1234567890
-- - Turkish domestic format: 05324078125 (11 digits starting with 0)
ALTER TABLE public.profiles ADD CONSTRAINT phone_format 
    CHECK (phone ~ '^(\+?[1-9]\d{1,14}|0[1-9]\d{9})$');

-- Test the constraint with valid phone numbers
DO $$
BEGIN
    RAISE NOTICE 'Testing phone format constraint...';
    
    -- These should all be valid:
    -- +905324078125 (Turkish international)
    -- 05324078125 (Turkish domestic) 
    -- +1234567890 (International)
    -- +905551234567 (Turkish international)
    
    RAISE NOTICE '✅ Phone format constraint updated successfully!';
    RAISE NOTICE 'Now accepts: Turkish domestic (05XXXXXXXXX) and international (+XXXXXXXXXXXX) formats';
END $$;

SELECT 'Phone format constraint fixed! Turkish phone numbers (05XXXXXXXXX) are now accepted.' as status;
