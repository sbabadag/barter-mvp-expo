-- Add postal code constraints after table creation
-- Run this after the main complete_setup.sql if you get postal code constraint errors

-- Add postal code constraints safely
DO $$
BEGIN
    -- Add home postal code constraint if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'profiles' AND column_name = 'home_postal_code') THEN
        BEGIN
            ALTER TABLE public.profiles ADD CONSTRAINT home_postal_code_format 
            CHECK (home_postal_code ~ '^\d{5}$');
            RAISE NOTICE 'Added home_postal_code_format constraint';
        EXCEPTION
            WHEN duplicate_object THEN
                RAISE NOTICE 'home_postal_code_format constraint already exists';
        END;
    ELSE
        RAISE NOTICE 'home_postal_code column does not exist, skipping constraint';
    END IF;

    -- Add work postal code constraint if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'profiles' AND column_name = 'work_postal_code') THEN
        BEGIN
            ALTER TABLE public.profiles ADD CONSTRAINT work_postal_code_format 
            CHECK (work_postal_code ~ '^\d{5}$');
            RAISE NOTICE 'Added work_postal_code_format constraint';
        EXCEPTION
            WHEN duplicate_object THEN
                RAISE NOTICE 'work_postal_code_format constraint already exists';
        END;
    ELSE
        RAISE NOTICE 'work_postal_code column does not exist, skipping constraint';
    END IF;
END $$;

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Postal code constraints added successfully!';
    RAISE NOTICE '📮 Both home and work postal codes now require 5-digit format';
END $$;
