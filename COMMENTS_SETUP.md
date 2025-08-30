# Comments System Setup

## Current Status ✅
The comments system is **fully implemented** and working in **mock mode**. You can test all functionality:

- ✅ View existing comments on listings
- ✅ Add new comments with Turkish usernames
- ✅ Real-time timestamp display ("2 dk önce", "3 saat önce")
- ✅ Full UI with avatars, scroll, keyboard handling
- ✅ Empty state messaging

## How to Enable Real Database

When you're ready to use the real Supabase database instead of mock data:

### Step 1: Create Comments Table

Run this SQL in your Supabase dashboard (SQL Editor):

```sql
-- Comments for listings (public social feature)
create table if not exists comments (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid references listings(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  user_name text not null,
  user_avatar text,
  comment_text text not null,
  created_at timestamp with time zone default now()
);

-- Row Level Security policies
alter table comments enable row level security;

create policy "anyone can read comments"
on comments for select using (true);

create policy "authenticated users can create comments"
on comments for insert with check (auth.uid() = user_id);

create policy "users can update their own comments"
on comments for update using (auth.uid() = user_id);
```

### Step 2: Enable Real Database

In your `.env` file, uncomment the real Supabase credentials:

```env
# Uncomment these lines:
EXPO_PUBLIC_SUPABASE_URL=https://guvdkdyrmmoyadmapokx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Comment out these lines:
# EXPO_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=placeholder-key
```

### Step 3: Restart App

```bash
npx expo start --clear
```

## Features

### Mock Mode (Current)
- Turkish sample comments with realistic data
- Instant feedback for testing
- No database setup required

### Real Database Mode
- Persistent comments across app sessions
- User authentication integration
- Real-time updates across devices
- Production-ready scalability

## Usage

1. **Tap comment icon (💬)** on any listing card
2. **View existing comments** with user info and timestamps
3. **Add new comments** using the input field
4. **See immediate updates** in the comment list

The system automatically handles:
- User avatar generation
- Timestamp formatting in Turkish
- Character limits and validation
- Loading states and error handling
- Cache invalidation for real-time feel

## Technical Notes

- Comments are linked to `listing_id` for proper organization
- Includes both `user_id` (for auth) and `user_name` (for display)
- Supports user avatars via URL
- Timestamps are stored in ISO format with timezone
- Full React Query integration for caching and updates
