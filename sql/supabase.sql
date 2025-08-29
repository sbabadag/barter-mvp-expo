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

-- Messages
create table if not exists messages (
  id bigserial primary key,
  chat_id uuid references chats(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete cascade,
  content text not null,
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

-- RLS
alter table profiles enable row level security;
alter table listings enable row level security;
alter table listing_photos enable row level security;
alter table offers enable row level security;
alter table chats enable row level security;
alter table messages enable row level security;
alter table ratings enable row level security;

-- Policies
create policy "public can read active listings"
on listings for select
using (status = 'active');

create policy "seller can manage their listings"
on listings for all
using (auth.uid() = seller_id)
with check (auth.uid() = seller_id);

create policy "public can read listing photos"
on listing_photos for select using (true);

create policy "seller can manage their listing photos"
on listing_photos for all
using (
  exists (select 1 from listings l where l.id = listing_id and l.seller_id = auth.uid())
)
with check (
  exists (select 1 from listings l where l.id = listing_id and l.seller_id = auth.uid())
);

create policy "users can read/write their profile"
on profiles for all
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "participants can read chat + messages"
on chats for select using (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "participants can write messages"
on messages for insert with check (
  exists (select 1 from chats c where c.id = chat_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid()))
);
create policy "participants can read messages"
on messages for select using (
  exists (select 1 from chats c where c.id = chat_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid()))
);

create policy "auth users can create offers"
on offers for insert with check (auth.uid() = from_user_id);
create policy "participants can read offers"
on offers for select using (
  auth.uid() = from_user_id or exists (select 1 from listings l where l.id = listing_id and l.seller_id = auth.uid())
);
