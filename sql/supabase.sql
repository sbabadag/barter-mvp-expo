-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  city text,
  avatar_url text,
  phone text,
  created_at timestamp with time zone default now()
);

-- Listings
create table if not exists listings (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid references auth.users(id) on delete set null,
  title text not null,
  description text not null,
  price numeric,
  status text not null default 'active', -- active/reserved/sold
  created_at timestamp with time zone default now()
);

-- Listing photos
create table if not exists listing_photos (
  id bigserial primary key,
  listing_id uuid references listings(id) on delete cascade,
  url text not null,
  sort_order int default 0,
  created_at timestamp with time zone default now()
);

-- Offers
create table if not exists offers (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid references listings(id) on delete cascade,
  from_user_id uuid references auth.users(id) on delete cascade,
  type text not null check (type in ('swap','cash','mix')),
  offered_listing_id uuid references listings(id),
  cash_amount numeric,
  message text,
  status text not null default 'pending', -- pending/accepted/rejected/cancelled
  created_at timestamp with time zone default now()
);

-- Chats
create table if not exists chats (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid references listings(id) on delete cascade,
  buyer_id uuid references auth.users(id) on delete cascade,
  seller_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now()
);

-- Chat messages
create table if not exists messages (
  id bigserial primary key,
  chat_id uuid references chats(id) on delete cascade,
  from_user_id uuid references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default now()
);

-- Comments for listings (public social feature)
create table if not exists comments (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid references listings(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null, -- Allow null for anonymous comments
  user_name text not null,
  user_avatar text,
  comment_text text not null,
  created_at timestamp with time zone default now()
);

-- Ratings
create table if not exists ratings (
  id bigserial primary key,
  from_user_id uuid references auth.users(id) on delete cascade,
  to_user_id uuid references auth.users(id) on delete cascade,
  stars int not null check (stars between 1 and 5),
  comment text,
  created_at timestamp with time zone default now()
);

-- Storage bucket policy reminder: create a public bucket named listing-photos

-- Enable Row Level Security
alter table profiles enable row level security;
alter table listings enable row level security;
alter table listing_photos enable row level security;
alter table offers enable row level security;
alter table chats enable row level security;
alter table messages enable row level security;
alter table comments enable row level security;
alter table ratings enable row level security;

-- Policies for listings
drop policy if exists "public can read active listings" on listings;
create policy "public can read active listings"
on listings for select
using (status = 'active');

drop policy if exists "seller can manage their listings" on listings;
create policy "seller can manage their listings"
on listings for all
using (auth.uid() = seller_id)
with check (auth.uid() = seller_id);

-- Policies for listing photos
drop policy if exists "public can read listing photos" on listing_photos;
create policy "public can read listing photos"
on listing_photos for select using (true);

drop policy if exists "seller can manage their listing photos" on listing_photos;
create policy "seller can manage their listing photos"
on listing_photos for all
using (
  exists (select 1 from listings l where l.id = listing_id and l.seller_id = auth.uid())
)
with check (
  exists (select 1 from listings l where l.id = listing_id and l.seller_id = auth.uid())
);

-- Policies for profiles
drop policy if exists "users can read/write their profile" on profiles;
create policy "users can read/write their profile"
on profiles for all
using (auth.uid() = id)
with check (auth.uid() = id);

-- Allow public read of profiles for marketplace features
drop policy if exists "public can read profiles" on profiles;
create policy "public can read profiles"
on profiles for select using (true);

-- Allow authenticated users to create their own profile
drop policy if exists "users can create their own profile" on profiles;
create policy "users can create their own profile"
on profiles for insert
with check (auth.uid() = id);

-- Policies for chats and messages
drop policy if exists "participants can read chat + messages" on chats;
create policy "participants can read chat + messages"
on chats for select using (auth.uid() = buyer_id or auth.uid() = seller_id);

drop policy if exists "participants can write messages" on messages;
create policy "participants can write messages"
on messages for insert with check (
  exists (select 1 from chats c where c.id = chat_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid()))
);

drop policy if exists "participants can read messages" on messages;
create policy "participants can read messages"
on messages for select using (
  exists (select 1 from chats c where c.id = chat_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid()))
);

-- Policies for offers
drop policy if exists "auth users can create offers" on offers;
create policy "auth users can create offers"
on offers for insert with check (auth.uid() = from_user_id);

drop policy if exists "participants can read offers" on offers;
create policy "participants can read offers"
on offers for select using (
  auth.uid() = from_user_id or exists (select 1 from listings l where l.id = listing_id and l.seller_id = auth.uid())
);

-- Policies for comments (public read, allow anonymous write for demo)
drop policy if exists "anyone can read comments" on comments;
create policy "anyone can read comments"
on comments for select using (true);

drop policy if exists "authenticated users can create comments" on comments;
create policy "anyone can create comments"
on comments for insert with check (true); -- Allow anonymous comments for demo

drop policy if exists "users can update their own comments" on comments;
create policy "users can update their own comments"
on comments for update using (
  auth.uid() = user_id OR user_id IS NULL -- Allow editing anonymous comments
);

-- Policies for ratings
drop policy if exists "users can read all ratings" on ratings;
create policy "users can read all ratings"
on ratings for select using (true);

drop policy if exists "users can create ratings" on ratings;
create policy "users can create ratings"
on ratings for insert with check (auth.uid() = from_user_id);

-- Indexes for performance
create index if not exists idx_listings_seller_id on listings(seller_id);
create index if not exists idx_listings_status on listings(status);
create index if not exists idx_listings_created_at on listings(created_at desc);
create index if not exists idx_listing_photos_listing_id on listing_photos(listing_id);
create index if not exists idx_offers_listing_id on offers(listing_id);
create index if not exists idx_offers_from_user_id on offers(from_user_id);
create index if not exists idx_chats_listing_id on chats(listing_id);
create index if not exists idx_messages_chat_id on messages(chat_id);
create index if not exists idx_comments_listing_id on comments(listing_id);
create index if not exists idx_comments_created_at on comments(created_at desc);
create index if not exists idx_ratings_to_user_id on ratings(to_user_id);
