import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";


// Export these values so we can check them in other files
export const supabaseConfig = {
  url: SUPABASE_URL,
  key: SUPABASE_ANON_KEY,
  isPlaceholder: SUPABASE_URL.includes('placeholder') || SUPABASE_ANON_KEY.includes('placeholder')
};



// Note: Replace with your actual Supabase URL and anon key in .env file
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); // Only real client is used
