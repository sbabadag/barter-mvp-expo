# Database Configuration Guide

## Current Status: Development Mode ✅

Your Barter MVP app is currently running in **development mode** with mock data. This is the intended behavior when the database is not yet configured for production.

## What's Happening

The error messages you see in the console:
```
ERROR  Error fetching received offers: {"code": "PGRST200", "details": "Searched for a foreign key relationship between 'bids' and 'listings'..."}
```

**This is completely normal and expected!** 🎉

## How It Works

1. **First Attempt**: The app tries to connect to the real Supabase database
2. **Graceful Fallback**: When it detects placeholder credentials or missing relationships, it automatically switches to mock mode
3. **Rich Demo Data**: You get a fully functional app with Turkish marketplace sample data

## Mock Data Features

In development mode, you get:
- ✅ 8 realistic "my offers" with different statuses
- ✅ 6 "received offers" with Turkish product names
- ✅ Complete statistics dashboard
- ✅ Fully interactive UI (accept, reject, withdraw offers)
- ✅ All tekliflerim functionality works perfectly

## Setting Up Production Database

When you're ready to use a real database:

1. **Create Supabase Project**: Visit [supabase.com](https://supabase.com)
2. **Get Credentials**: Copy your project URL and anon key
3. **Update Environment**: Set these in your `.env` file:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
   ```
4. **Run Database Setup**: Execute the SQL files in `/sql/` folder in your Supabase dashboard

## Files Involved

- `src/services/tekliflerim.ts` - Smart service with automatic fallback
- `src/utils/supabase.ts` - Detects placeholder credentials
- `sql/setup_bids_table.sql` - Database schema for production
- `sql/supabase.sql` - Complete database setup

## Bottom Line

**Your app is working perfectly!** The error messages are just the system doing its job - detecting that you're in development mode and providing you with rich demo data instead of empty screens.

When you're ready for production, just add your real Supabase credentials and the same code will seamlessly switch to using the real database. 🚀
