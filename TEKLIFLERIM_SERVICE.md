# Tekliflerim (My Offers) Service Documentation

## Overview
The `tekliflerim.ts` service provides comprehensive offer/bid management functionality for the Barter MVP app. It allows users to view, create, and manage their offers (both made and received) with enhanced features and better user experience.

## Key Features

### 📱 Enhanced Data Types
- **MyOffer**: Complete offer data with listing details, seller info, and calculated fields
- **ReceivedOffer**: Offers received on user's listings with bidder information
- **OfferStats**: Comprehensive statistics about user's offer activity

### 🎯 Smart Calculated Fields
- **Time Left**: Automatic calculation of remaining time ("2 saat kaldı", "Süresi doldu")
- **Price Difference**: Shows how much above/below listing price (-₺50, +₺20)
- **Price Percentage**: Percentage difference from listing price (-10%, +5%)
- **Expiration Status**: Automatic detection of expired offers

### 📊 Comprehensive Statistics
- Total offers made/received
- Pending offers count
- Accepted offers count
- Success rate calculation
- Visual dashboard with stats grid

### 🔄 Real-time State Management
- Uses React Query for caching and automatic updates
- Optimistic updates for better UX
- Automatic cache invalidation on mutations

## Service API

### Hooks

#### `useMyOffers()`
Returns user's made offers with complete listing and seller details.
```typescript
const { data: myOffers, isLoading, refetch } = useMyOffers();
```

#### `useReceivedOffers()`
Returns offers received on user's listings.
```typescript
const { data: receivedOffers, isLoading, refetch } = useReceivedOffers();
```

#### `useOfferStats()`
Returns comprehensive offer statistics.
```typescript
const { data: stats, isLoading, refetch } = useOfferStats();
```

### Mutations

#### `useCreateOffer()`
Creates a new offer with progress tracking.
```typescript
const createOfferMutation = useCreateOffer();
await createOfferMutation.mutateAsync({
  listingId: 'listing_123',
  amount: 450,
  message: 'İndirim var mı?',
  expiresIn24h: true
});
```

#### `useRespondToOffer()`
Respond to received offers (accept/reject/counter).
```typescript
const respondMutation = useRespondToOffer();
await respondMutation.mutateAsync({
  offerId: 'offer_123',
  action: 'accept' // or 'reject', 'counter'
});
```

#### `useWithdrawOffer()`
Withdraw/cancel a made offer.
```typescript
const withdrawMutation = useWithdrawOffer();
await withdrawMutation.mutateAsync('offer_123');
```

## UI Components

### TekliflerimScreen Features
- **Three Tabs**: Made offers, Received offers, Statistics
- **Smart Status Badges**: Color-coded status indicators
- **Rich Offer Cards**: Complete offer information with actions
- **Responsive Actions**: Context-sensitive buttons based on offer status
- **Pull-to-refresh**: Manual refresh capability
- **Empty States**: Beautiful empty state messages with icons

### Offer Card Features
- **Listing Preview**: Image, title, location, price
- **Status Tracking**: Visual status with time remaining
- **Message Display**: User messages and counter offers
- **User Profiles**: Seller/bidder information with ratings
- **Quick Actions**: Accept, reject, counter offer, withdraw

### Statistics Dashboard
- **Visual Grid**: 2x3 grid of key metrics
- **Key Metrics**: Total, pending, accepted counts and success rate
- **Real-time Updates**: Automatically updated when offers change

## Mock Data
The service includes comprehensive Turkish marketplace mock data:
- 4 sample made offers with different statuses
- 2 sample received offers
- Realistic Turkish product names and locations
- Time-based expiration simulation
- Detailed seller/bidder profiles

## Integration
- **Seamless Auth**: Integrates with existing AuthProvider
- **Query Caching**: Uses existing React Query setup
- **Navigation**: Integrated into tab navigation as "Tekliflerim"
- **Bidding Modal**: Enhanced existing BiddingModal to use new service

## Database Schema
Works with existing Supabase `bids` table structure:
```sql
create table bids (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid references listings(id),
  bidder_id uuid references profiles(id),
  amount numeric not null,
  message text,
  status text default 'pending',
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone,
  counter_offer_amount numeric,
  counter_offer_message text
);
```

## Status Flow
```
pending → accepted (deal completed)
pending → rejected (offer declined)  
pending → countered (seller makes counter offer)
pending → expired (24h timeout)
countered → accepted (counter offer accepted)
any → cancelled (user withdraws offer)
```

## Benefits Over Previous System
1. **Better UX**: Rich UI with comprehensive information
2. **Smart Calculations**: Automatic time/price calculations
3. **Statistics**: User engagement insights
4. **Type Safety**: Full TypeScript coverage
5. **Performance**: Optimized queries and caching
6. **Scalability**: React Query patterns for enterprise use
7. **Real-time**: Automatic updates and cache invalidation

## Usage Example
```typescript
// In a component
function MyOffersTab() {
  const { data: offers, isLoading } = useMyOffers();
  const createOffer = useCreateOffer();
  
  const handleMakeOffer = async () => {
    await createOffer.mutateAsync({
      listingId: 'listing_123',
      amount: 450,
      message: 'Nakit ödeme yaparım'
    });
  };
  
  return (
    <View>
      {offers?.map(offer => (
        <OfferCard key={offer.id} offer={offer} />
      ))}
    </View>
  );
}
```

This service provides a complete, production-ready offer management system with excellent user experience and developer experience.
