import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

// Export these values so we can check them in other files
export const supabaseConfig = {
  url: SUPABASE_URL,
  key: SUPABASE_ANON_KEY,
  isPlaceholder: SUPABASE_URL.includes("placeholder") || SUPABASE_URL.includes("your-project") || SUPABASE_ANON_KEY.includes("your-anon-key")
};

// Create a mock client for development to avoid network requests
const createMockSupabaseClient = () => {
  const createQueryBuilder = () => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: null, error: new Error("Mock mode - no real database") }),
    eq: () => ({ data: null, error: null }),
    single: () => ({ data: null, error: null }),
    order: () => ({ data: [], error: null }),
    limit: () => ({ data: [], error: null }),
    update: () => createQueryBuilder() // Allow method chaining
  });

  return {
    from: (table: string) => createQueryBuilder(),
    storage: {
      from: () => ({
        upload: () => ({ error: new Error("Mock mode - no real storage") })
      })
    },
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithOtp: () => Promise.resolve({ error: null }),
      signOut: () => Promise.resolve({ error: null }),
      signUp: () => Promise.resolve({ 
        data: { user: null, session: null }, 
        error: new Error("Mock mode - sign up disabled") 
      }),
      signInWithPassword: () => Promise.resolve({ 
        data: { user: null, session: null }, 
        error: new Error("Mock mode - sign in disabled") 
      }),
      verifyOtp: () => Promise.resolve({ 
        data: { user: null, session: null }, 
        error: new Error("Mock mode - OTP verification disabled") 
      })
    }
  };
};

// Note: Replace with your actual Supabase URL and anon key in .env file
export const supabase = supabaseConfig.isPlaceholder 
  ? createMockSupabaseClient() 
  : createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
