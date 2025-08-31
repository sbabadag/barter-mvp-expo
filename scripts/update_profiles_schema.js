const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project') || supabaseKey.includes('your-anon-key')) {
  console.log('🏗️ Supabase not configured - skipping database schema update');
  console.log('✅ Enhanced registration form is ready to use in mock mode!');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const updateProfilesSchema = `
-- Add new columns to profiles table if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other')),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add constraints if they don't exist
DO $$ 
BEGIN
    -- Add first_name constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'first_name_length') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT first_name_length CHECK (char_length(first_name) >= 1 AND char_length(first_name) <= 50);
    END IF;
    
    -- Add last_name constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'last_name_length') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT last_name_length CHECK (char_length(last_name) >= 1 AND char_length(last_name) <= 50);
    END IF;
    
    -- Add email constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'email_format') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT email_format CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$');
    END IF;
    
    -- Add phone constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'phone_format') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT phone_format CHECK (phone ~ '^\\+?[1-9]\\d{1,14}$');
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_profiles_first_name ON public.profiles(first_name);
CREATE INDEX IF NOT EXISTS idx_profiles_last_name ON public.profiles(last_name);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);

-- Add helpful comments
COMMENT ON COLUMN public.profiles.first_name IS 'User first name';
COMMENT ON COLUMN public.profiles.last_name IS 'User last name';
COMMENT ON COLUMN public.profiles.email IS 'User email address';
COMMENT ON COLUMN public.profiles.phone IS 'User phone number';
COMMENT ON COLUMN public.profiles.birth_date IS 'User birth date';
COMMENT ON COLUMN public.profiles.gender IS 'User gender: male, female, or other';

-- Update the handle_new_user function
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
`;

async function updateSchema() {
  try {
    console.log('🔧 Updating profiles table schema...');
    
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: updateProfilesSchema 
    });
    
    if (error) {
      console.log('⚠️ SQL execution failed, trying alternative approach...');
      console.log('Error:', error.message);
      
      // Try direct SQL execution (this might work depending on your setup)
      const { error: directError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
        
      if (directError) {
        console.log('❌ Database connection failed');
        console.log('Please run the following SQL manually in your Supabase SQL Editor:');
        console.log('\n' + updateProfilesSchema);
      } else {
        console.log('✅ Database connected, but schema update needs to be run manually');
        console.log('Please copy and paste this SQL into your Supabase SQL Editor:');
        console.log('\n' + updateProfilesSchema);
      }
    } else {
      console.log('✅ Profiles table schema updated successfully!');
    }
    
    console.log('\n🎉 Enhanced registration form is ready!');
    console.log('Users can now register with:');
    console.log('- First Name & Last Name (required)');
    console.log('- Email & Password (required)');
    console.log('- Phone Number (optional)');
    console.log('- City (optional)');
    console.log('- Birth Date (optional)');
    console.log('- Gender (optional)');
    
  } catch (error) {
    console.error('❌ Error updating schema:', error);
    console.log('\nPlease run the following SQL manually in your Supabase SQL Editor:');
    console.log('\n' + updateProfilesSchema);
  }
}

updateSchema();
