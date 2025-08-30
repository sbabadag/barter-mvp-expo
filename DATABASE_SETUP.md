# Bidding System Database Setup

## Current Issue

The app is showing these errors:
```
PGRST200: Could not find a relationship between 'bids' and 'profiles' in the schema cache
```

This happens because the database tables are not set up yet. The app is designed to gracefully fall back to mock data when tables are missing.

## Quick Fix (Use Mock Data Only)

The app currently works with mock data and doesn't require any database setup. If you see the errors above, they're expected and the app will continue to work with sample data.
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=placeholder-key
   ```

2. Or temporarily modify `src/utils/supabase.ts` to force mock mode:
   ```typescript
   export const supabaseConfig = {
     url: SUPABASE_URL,
     key: SUPABASE_ANON_KEY,
     isPlaceholder: true // Force mock mode
   };
   ```

## Current Behavior
The app now gracefully falls back to mock data when database tables don't exist, so bidding functionality should work even without the database setup.

## Database Schema Created
The migration creates:
- `bids` table with all necessary columns
- Proper indexes for performance
- Row Level Security (RLS) policies
- Automatic updated_at timestamps
- Data validation constraints

## Testing
After applying the migration:
1. Create a test user in the app
2. Navigate to listing details
3. Try creating bids
4. Check the Supabase dashboard to see real data
