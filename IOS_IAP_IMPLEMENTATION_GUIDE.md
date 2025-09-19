# iOS In-App Purchases Implementation Guide - ESKICI Marketplace

## Overview
This guide covers implementing in-app purchases for premium features in your ESKICI marketplace app using React Native and Expo.

## 1. Premium Features for ESKICI Marketplace

### Suggested Premium Features:
- **Premium Listings**: Featured placement, extra photos, extended duration
- **Advanced Search**: Priority filtering, save searches with alerts
- **Premium Communication**: Unlimited messages, read receipts, priority support
- **Business Account**: Bulk listing tools, analytics dashboard, verified badge
- **Advertisement-Free Experience**: Remove ads from the app

### Pricing Strategy:
- **Monthly Premium**: ₺29.99/month
- **Annual Premium**: ₺299.99/year (Save 16%)
- **Listing Boost**: ₺9.99 per listing
- **Business Account**: ₺99.99/month

## 2. Technical Implementation

### Dependencies to Add:
```bash
npm install react-native-iap
npx expo install expo-store-kit
```

### App Store Connect Configuration:
1. Create in-app purchase products in App Store Connect
2. Set up pricing tiers for Turkish Lira (₺)
3. Configure auto-renewable subscriptions
4. Add localized descriptions in Turkish

### Product IDs:
- `premium_monthly`: Monthly premium subscription
- `premium_annual`: Annual premium subscription
- `listing_boost`: Single listing boost
- `business_monthly`: Monthly business account

## 3. Code Structure

### Files to Create:
- `src/services/iap.ts` - In-app purchase service
- `src/components/PremiumModal.tsx` - Premium upgrade modal
- `src/components/PaywallScreen.tsx` - Full-screen paywall
- `src/hooks/usePremium.ts` - Premium status hook
- `src/utils/products.ts` - Product definitions

## 4. Database Schema Updates

### Add to Supabase:
```sql
-- Premium subscriptions table
CREATE TABLE user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  transaction_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
  starts_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchase history
CREATE TABLE purchase_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  amount NUMERIC(10,2),
  currency TEXT DEFAULT 'TRY',
  status TEXT NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add premium features to users table
ALTER TABLE profiles ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN premium_expires_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN is_business BOOLEAN DEFAULT FALSE;
```

## 5. iOS App Store Connect Setup

### 1. App Store Connect Configuration:
- Go to App Store Connect → Your App → Features → In-App Purchases
- Create new products for each premium feature
- Set pricing in Turkish Lira
- Add localizations for Turkish market

### 2. Tax Information:
- Set up tax information for Turkish sales
- Configure VAT settings for Turkey (20% VAT)

### 3. Testing:
- Create sandbox test accounts
- Test purchases in iOS Simulator/Device
- Verify receipt validation

## 6. Security Considerations

### Receipt Validation:
- Implement server-side receipt validation
- Use Supabase Edge Functions for validation
- Store validated receipts in database

### Fraud Prevention:
- Validate receipts on every app launch
- Implement receipt refresh logic
- Handle subscription status changes

## 7. User Experience

### Premium Upgrade Flow:
1. User encounters premium feature
2. Show premium benefits modal
3. Display pricing options
4. Handle purchase flow
5. Activate premium features
6. Show confirmation

### Free Trial:
- Offer 7-day free trial for new users
- Graceful degradation when trial expires
- Clear upgrade prompts

## 8. Revenue Optimization

### A/B Testing:
- Test different pricing strategies
- Experiment with feature bundles
- Optimize upgrade prompts

### Analytics:
- Track conversion rates
- Monitor churn rates
- Analyze premium feature usage

## 9. Turkish Market Considerations

### Localization:
- All purchase flows in Turkish
- Pricing in Turkish Lira (₺)
- Local payment methods support

### Legal Compliance:
- Add VAT information to receipts
- Comply with Turkish consumer protection laws
- Provide clear cancellation policies

## 10. Implementation Priority

### Phase 1 (MVP):
1. Basic subscription system
2. Premium listing features
3. Receipt validation

### Phase 2 (Enhanced):
1. Business accounts
2. Advanced analytics
3. Multiple subscription tiers

### Phase 3 (Advanced):
1. Family sharing
2. Corporate accounts
3. Promotional codes

## Next Steps
1. Set up App Store Connect products
2. Implement basic IAP service
3. Create premium feature gates
4. Test with sandbox accounts
5. Submit for App Review

This system will provide a robust foundation for monetizing your ESKICI marketplace app while providing real value to your users.