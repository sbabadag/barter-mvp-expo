# Database Setup Guide for Tekliflerim Service

## Quick Setup (For Mock Mode)
The app is currently configured to work in **mock mode** by default. All offer/bid functionality works with sample data - no database setup required!

## Real Database Setup (Optional)

If you want to use a real Supabase database instead of mock data, follow these steps:

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be ready
4. Go to Settings → API to get your credentials

### 2. Set Environment Variables
Create a `.env` file in your project root:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Run Database Setup SQL
1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `sql/complete_database_setup.sql`
4. Click "Run" to execute the SQL

### 4. Enable Row Level Security (Optional)
The SQL script includes RLS policies, but you may want to customize them based on your needs.

### 5. Test the Connection
Restart your Expo app. The console should show:
```
Supabase config: { url: "your_actual_url", isPlaceholder: false }
```

## Database Schema

### Bids Table Structure
```sql
create table bids (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid not null references listings(id) on delete cascade,
  bidder_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null check (amount > 0),
  message text,
  status text not null default 'pending',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  expires_at timestamp with time zone,
  counter_offer_amount numeric,
  counter_offer_message text
);
```

### Required Relationships
The tekliflerim service expects these foreign key relationships:
- `bids.listing_id` → `listings.id`
- `bids.bidder_id` → `auth.users.id` 
- `listings.seller_id` → `auth.users.id`

## Troubleshooting

### Common Issues

#### "Could not find a relationship" Error
This means the foreign key constraints are missing. Run:
```sql
-- Add missing foreign key constraints
ALTER TABLE bids ADD CONSTRAINT bids_listing_id_fkey 
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE;

ALTER TABLE bids ADD CONSTRAINT bids_bidder_id_fkey 
  FOREIGN KEY (bidder_id) REFERENCES auth.users(id) ON DELETE CASCADE;
```

#### "Table 'bids' doesn't exist" Error
Run the complete database setup SQL from `sql/complete_database_setup.sql`

#### Authentication Issues
Make sure you have authentication set up in your Supabase project and that users can sign up/login.

## Features by Mode

### Mock Mode (Default)
✅ View sample offers (made and received)  
✅ Create new offers (stored in memory)  
✅ Accept/reject/counter offers  
✅ Withdraw offers  
✅ View statistics  
✅ Full UI functionality  
❌ Data persistence between app restarts  
❌ Real user authentication  
❌ Multi-user functionality  

### Real Database Mode
✅ All mock mode features  
✅ Data persistence  
✅ Real user authentication  
✅ Multi-user functionality  
✅ Real-time updates  
✅ Production-ready scaling  

## Migration from Mock to Real

When you're ready to switch from mock to real database:

1. Set up Supabase as described above
2. Restart your app
3. All existing mock data will be replaced with real database data
4. Users will need to authenticate to see their offers

The tekliflerim service automatically detects the mode and switches between mock and real data seamlessly!
