-- Create bids table for offer/bidding functionality
-- This table is separate from the offers table to handle simpler bid scenarios

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

-- Add indexes for better performance
create index if not exists idx_bids_listing_id on bids(listing_id);
create index if not exists idx_bids_bidder_id on bids(bidder_id);
create index if not exists idx_bids_status on bids(status);
create index if not exists idx_bids_created_at on bids(created_at desc);

-- Add updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger if not exists update_bids_updated_at 
  before update on bids 
  for each row 
  execute function update_updated_at_column();

-- Add RLS (Row Level Security) policies if needed
alter table bids enable row level security;

-- Policy: Users can view bids on their own listings
create policy "Users can view bids on their listings" on bids
  for select using (
    listing_id in (
      select id from listings where seller_id = auth.uid()
    )
  );

-- Policy: Users can view their own bids
create policy "Users can view their own bids" on bids
  for select using (bidder_id = auth.uid());

-- Policy: Authenticated users can create bids (but not on their own listings)
create policy "Users can create bids" on bids
  for insert with check (
    auth.role() = 'authenticated' 
    and bidder_id = auth.uid()
    and listing_id not in (
      select id from listings where seller_id = auth.uid()
    )
  );

-- Policy: Users can update their own bids (for withdrawal/cancellation)
create policy "Users can update their own bids" on bids
  for update using (bidder_id = auth.uid());

-- Policy: Listing owners can update bid status (accept/reject/counter)
create policy "Listing owners can update bid status" on bids
  for update using (
    listing_id in (
      select id from listings where seller_id = auth.uid()
    )
  ) with check (
    listing_id in (
      select id from listings where seller_id = auth.uid()
    )
  );

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

-- You can set up a cron job to run this function periodically
-- For now, we'll handle expiration in the application code
