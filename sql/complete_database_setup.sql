-- Complete database setup for Barter MVP
-- Run this script to set up all required tables

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  city text,
  avatar_url text,
  phone text,
  created_at timestamp with time zone default now()
);

-- Listings table with enhanced columns
create table if not exists listings (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid references auth.users(id) on delete set null,
  title text not null,
  description text not null,
  price numeric,
  currency text default 'TRY',
  category text,
  location text,
  condition text check (condition in ('new', 'like_new', 'good', 'fair', 'poor')),
  status text not null default 'active' check (status in ('active', 'reserved', 'sold', 'inactive')),
  image_url text, -- Primary image URL
  images text[], -- Array of image URLs
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Listing photos table (alternative to images array)
create table if not exists listing_photos (
  id bigserial primary key,
  listing_id uuid references listings(id) on delete cascade,
  url text not null,
  sort_order int default 0,
  created_at timestamp with time zone default now()
);

-- Bids table (simple bidding system)
create table if not exists bids (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid not null references listings(id) on delete cascade,
  bidder_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null check (amount > 0),
  message text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'countered', 'expired', 'cancelled')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  expires_at timestamp with time zone,
  counter_offer_amount numeric check (counter_offer_amount > 0),
  counter_offer_message text
);

-- Offers table (complex trading system)
create table if not exists offers (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid references listings(id) on delete cascade,
  from_user_id uuid references auth.users(id) on delete cascade,
  type text not null check (type in ('swap','cash','mix')),
  offered_listing_id uuid references listings(id),
  cash_amount numeric,
  message text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at timestamp with time zone default now()
);

-- Chats table
create table if not exists chats (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid references listings(id) on delete cascade,
  buyer_id uuid references auth.users(id) on delete cascade,
  seller_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now()
);

-- Chat messages table
create table if not exists messages (
  id bigserial primary key,
  chat_id uuid references chats(id) on delete cascade,
  from_user_id uuid references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default now()
);

-- Comments table
create table if not exists comments (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid references listings(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  user_name text not null,
  user_avatar text,
  comment_text text not null,
  created_at timestamp with time zone default now()
);

-- Ratings table
create table if not exists ratings (
  id bigserial primary key,
  from_user_id uuid references auth.users(id) on delete cascade,
  to_user_id uuid references auth.users(id) on delete cascade,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default now()
);

-- Add indexes for better performance
create index if not exists idx_listings_seller_id on listings(seller_id);
create index if not exists idx_listings_status on listings(status);
create index if not exists idx_listings_category on listings(category);
create index if not exists idx_listings_location on listings(location);
create index if not exists idx_listings_created_at on listings(created_at desc);

create index if not exists idx_bids_listing_id on bids(listing_id);
create index if not exists idx_bids_bidder_id on bids(bidder_id);
create index if not exists idx_bids_status on bids(status);
create index if not exists idx_bids_created_at on bids(created_at desc);

create index if not exists idx_offers_listing_id on offers(listing_id);
create index if not exists idx_offers_from_user_id on offers(from_user_id);
create index if not exists idx_offers_status on offers(status);

-- Add updated_at triggers
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger if not exists update_listings_updated_at 
  before update on listings 
  for each row 
  execute function update_updated_at_column();

create trigger if not exists update_bids_updated_at 
  before update on bids 
  for each row 
  execute function update_updated_at_column();

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table listings enable row level security;
alter table listing_photos enable row level security;
alter table bids enable row level security;
alter table offers enable row level security;
alter table chats enable row level security;
alter table messages enable row level security;
alter table comments enable row level security;
alter table ratings enable row level security;

-- Basic RLS policies for listings
create policy "Anyone can view active listings" on listings
  for select using (status = 'active');

create policy "Users can create their own listings" on listings
  for insert with check (auth.uid() = seller_id);

create policy "Users can update their own listings" on listings
  for update using (auth.uid() = seller_id);

-- Basic RLS policies for bids
create policy "Users can view bids on their listings" on bids
  for select using (
    listing_id in (
      select id from listings where seller_id = auth.uid()
    )
  );

create policy "Users can view their own bids" on bids
  for select using (bidder_id = auth.uid());

create policy "Users can create bids" on bids
  for insert with check (
    auth.role() = 'authenticated' 
    and bidder_id = auth.uid()
    and listing_id not in (
      select id from listings where seller_id = auth.uid()
    )
  );

create policy "Users can update their own bids" on bids
  for update using (bidder_id = auth.uid());

create policy "Listing owners can update bid status" on bids
  for update using (
    listing_id in (
      select id from listings where seller_id = auth.uid()
    )
  );

-- Basic RLS policies for profiles
create policy "Users can view all profiles" on profiles
  for select using (true);

create policy "Users can create their own profile" on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile" on profiles
  for update using (auth.uid() = id);

-- Basic RLS policies for comments
create policy "Anyone can view comments" on comments
  for select using (true);

create policy "Authenticated users can create comments" on comments
  for insert with check (auth.role() = 'authenticated');

-- Function to automatically expire bids
create or replace function expire_old_bids()
returns void as $$
begin
  update bids 
  set status = 'expired'
  where status = 'pending' 
    and expires_at is not null 
    and expires_at < now();
end;
$$ language plpgsql;
