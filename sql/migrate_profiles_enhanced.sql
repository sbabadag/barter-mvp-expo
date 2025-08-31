-- Enhanced Profiles Table Migration Script
-- Run this in your Supabase SQL Editor to add new user registration fields

-- Step 1: Add new columns to profiles table (safe operation - won't fail if columns exist)
DO $$ 
BEGIN
    -- Add new columns with IF NOT EXISTS pattern
    BEGIN
        ALTER TABLE public.profiles ADD COLUMN first_name TEXT;
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column first_name already exists';
    END;
    
    BEGIN
        ALTER TABLE public.profiles ADD COLUMN last_name TEXT;
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column last_name already exists';
    END;
    
    BEGIN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column email already exists';
    END;
    
    BEGIN
        ALTER TABLE public.profiles ADD COLUMN phone TEXT;
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column phone already exists';
    END;
    
    BEGIN
        ALTER TABLE public.profiles ADD COLUMN birth_date DATE;
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column birth_date already exists';
    END;
    
    BEGIN
        ALTER TABLE public.profiles ADD COLUMN gender TEXT;
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column gender already exists';
    END;
    
    BEGIN
        ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column updated_at already exists';
    END;
    
    BEGIN
        ALTER TABLE public.profiles ADD COLUMN home_address TEXT;
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column home_address already exists';
    END;
    
    BEGIN
        ALTER TABLE public.profiles ADD COLUMN home_postal_code TEXT;
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column home_postal_code already exists';
    END;
    
    BEGIN
        ALTER TABLE public.profiles ADD COLUMN work_address TEXT;
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column work_address already exists';
    END;
    
    BEGIN
        ALTER TABLE public.profiles ADD COLUMN work_postal_code TEXT;
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column work_postal_code already exists';
    END;
END $$;

-- Step 2: Add constraints (safe operation - won't fail if constraints exist)
DO $$ 
BEGIN
    -- Add first_name constraint
    BEGIN
        ALTER TABLE public.profiles ADD CONSTRAINT first_name_length CHECK (char_length(first_name) >= 1 AND char_length(first_name) <= 50);
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'Constraint first_name_length already exists';
    END;
    
    -- Add last_name constraint
    BEGIN
        ALTER TABLE public.profiles ADD CONSTRAINT last_name_length CHECK (char_length(last_name) >= 1 AND char_length(last_name) <= 50);
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'Constraint last_name_length already exists';
    END;
    
    -- Add email constraint
    BEGIN
        ALTER TABLE public.profiles ADD CONSTRAINT email_format CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'Constraint email_format already exists';
    END;
    
    -- Add phone constraint
    BEGIN
        ALTER TABLE public.profiles ADD CONSTRAINT phone_format CHECK (phone ~ '^\+?[1-9]\d{1,14}$');
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'Constraint phone_format already exists';
    END;
    
    -- Add gender constraint
    BEGIN
        ALTER TABLE public.profiles ADD CONSTRAINT gender_values CHECK (gender IN ('male', 'female', 'other'));
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'Constraint gender_values already exists';
    END;
    
    -- Add home postal code constraint (Turkish postal codes: 5 digits)
    BEGIN
        ALTER TABLE public.profiles ADD CONSTRAINT home_postal_code_format CHECK (home_postal_code ~ '^\d{5}$');
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'Constraint home_postal_code_format already exists';
    END;
    
    -- Add work postal code constraint (Turkish postal codes: 5 digits)
    BEGIN
        ALTER TABLE public.profiles ADD CONSTRAINT work_postal_code_format CHECK (work_postal_code ~ '^\d{5}$');
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'Constraint work_postal_code_format already exists';
    END;
    
    -- Add home address length constraint
    BEGIN
        ALTER TABLE public.profiles ADD CONSTRAINT home_address_length CHECK (char_length(home_address) <= 200);
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'Constraint home_address_length already exists';
    END;
    
    -- Add work address length constraint
    BEGIN
        ALTER TABLE public.profiles ADD CONSTRAINT work_address_length CHECK (char_length(work_address) <= 200);
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'Constraint work_address_length already exists';
    END;
END $$;

-- Step 3: Create indexes (safe operation - won't fail if indexes exist)
CREATE INDEX IF NOT EXISTS idx_profiles_first_name ON public.profiles(first_name);
CREATE INDEX IF NOT EXISTS idx_profiles_last_name ON public.profiles(last_name);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_home_postal_code ON public.profiles(home_postal_code);
CREATE INDEX IF NOT EXISTS idx_profiles_work_postal_code ON public.profiles(work_postal_code);

-- Step 4: Add helpful comments
COMMENT ON TABLE public.profiles IS 'Extended user profile information for displaying names, contact info, and personal details';
COMMENT ON COLUMN public.profiles.display_name IS 'Display name shown to other users (usually first_name + last_name)';
COMMENT ON COLUMN public.profiles.first_name IS 'User first name';
COMMENT ON COLUMN public.profiles.last_name IS 'User last name';
COMMENT ON COLUMN public.profiles.email IS 'User email address';
COMMENT ON COLUMN public.profiles.phone IS 'User phone number';
COMMENT ON COLUMN public.profiles.city IS 'User city/location';
COMMENT ON COLUMN public.profiles.birth_date IS 'User birth date';
COMMENT ON COLUMN public.profiles.gender IS 'User gender: male, female, or other';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to user avatar image';
COMMENT ON COLUMN public.profiles.home_address IS 'User home address';
COMMENT ON COLUMN public.profiles.home_postal_code IS 'User home postal code (5 digits)';
COMMENT ON COLUMN public.profiles.work_address IS 'User work/office address';
COMMENT ON COLUMN public.profiles.work_postal_code IS 'User work postal code (5 digits)';

-- Step 5: Update the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', 'Yeni Kullanıcı'),
        COALESCE(NEW.raw_user_meta_data->>'email', NEW.email)
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Add trigger for updated_at field
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if exists, then create new one
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Update RLS Policies (Critical for profile creation)
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Enable Row Level Security if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view all profiles (for displaying user names in bids, etc.)
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (CRITICAL for registration)
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Enhanced profiles table migration completed successfully!'; 
    RAISE NOTICE '📋 New columns added: first_name, last_name, email, phone, birth_date, gender, updated_at, home_address, home_postal_code, work_address, work_postal_code';
    RAISE NOTICE '🔒 Constraints added for data validation';
    RAISE NOTICE '⚡ Indexes added for better performance';
    RAISE NOTICE '🔐 RLS Policies updated for profile creation';
    RAISE NOTICE '🏠 Address fields added for home and work locations';
    RAISE NOTICE '🚀 Enhanced registration form is now ready to use!';
END $$;
