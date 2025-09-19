# Premium Features Integration Examples

This guide shows how to integrate the premium features throughout the ESKICI app using the new IAP system and premium gate components.

## Overview

The premium system consists of:
- **Premium Modal**: Beautiful upgrade screen with pricing options
- **Premium Gate Hook**: Easy feature access control
- **IAP Service**: Complete in-app purchase handling
- **Haptic Feedback**: Enhanced user experience

## Example Integrations

### 1. Add Listing Screen (✅ Implemented)

**File**: `app/add-listing.tsx`

**Features Integrated**:
- Photo limit: 3 free → 10 premium
- Featured listing option
- Premium hints and badges

**Key Code**:
```tsx
// Premium gate initialization
const { isPremium, showPremiumModal, closePremiumModal, checkPremiumAccess } = usePremiumGate();

// Photo limit check
const maxPhotos = isPremium ? 10 : 3;
if (images.length >= maxPhotos && !isPremium) {
  // Show premium modal
  checkPremiumAccess(() => {});
}

// Featured listing option
<Pressable 
  onPress={() => {
    if (!isPremium) {
      checkPremiumAccess(() => setIsFeatured(true));
    } else {
      setIsFeatured(!isFeatured);
    }
  }}
>
```

### 2. Search Screen Integration

**File**: `app/(tabs)/search.tsx` (to be implemented)

**Premium Features**:
- Advanced filters (price range, distance, date posted)
- Saved searches
- Search alerts/notifications

**Implementation Example**:
```tsx
import { usePremiumGate, PREMIUM_FEATURES } from '../src/hooks/usePremiumGate';
import PremiumModal from '../src/components/PremiumModal';

export default function SearchScreen() {
  const { isPremium, showPremiumModal, closePremiumModal, checkPremiumAccess } = usePremiumGate();
  
  const handleAdvancedFilter = () => {
    checkPremiumAccess(() => {
      // Show advanced filters
      setShowAdvancedFilters(true);
    });
  };

  return (
    <View>
      {/* Basic search controls */}
      
      <Pressable onPress={handleAdvancedFilter}>
        <Text>Gelişmiş Filtreler</Text>
        {!isPremium && <Text style={styles.premiumBadge}>Premium</Text>}
      </Pressable>

      <PremiumModal 
        visible={showPremiumModal}
        onClose={closePremiumModal}
        feature={PREMIUM_FEATURES.ADVANCED_SEARCH}
      />
    </View>
  );
}
```

### 3. Profile Screen Integration

**File**: `app/profile.tsx` (to be implemented)

**Premium Features**:
- Verified badge
- Analytics access
- Export data

**Implementation Example**:
```tsx
const ProfileHeader = () => {
  const { isPremium, checkPremiumAccess } = usePremiumGate();
  
  return (
    <View style={styles.profileHeader}>
      <Image source={{ uri: user.avatar }} style={styles.avatar} />
      <Text style={styles.username}>
        {user.name}
        {isPremium && (
          <MaterialIcons name="verified" size={20} color="#f0a500" />
        )}
      </Text>
      
      {!isPremium && (
        <Pressable onPress={() => checkPremiumAccess(() => {})}>
          <Text style={styles.verifiedBadgePromo}>
            ✨ Doğrulanmış rozet al
          </Text>
        </Pressable>
      )}
    </View>
  );
};
```

### 4. Listing Analytics Integration

**File**: `app/listing/[id]/analytics.tsx` (to be created)

**Premium Feature**: Detailed listing performance metrics

**Implementation Example**:
```tsx
import { usePremiumGate, PREMIUM_FEATURES } from '../../../src/hooks/usePremiumGate';

export default function ListingAnalyticsScreen() {
  const { isPremium, showPremiumModal, closePremiumModal } = usePremiumGate();
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    if (isPremium) {
      loadAnalyticsData();
    }
  }, [isPremium]);

  if (!isPremium) {
    return (
      <View style={styles.premiumRequired}>
        <MaterialIcons name="analytics" size={48} color="#f0a500" />
        <Text style={styles.premiumTitle}>İlan Analitikleri</Text>
        <Text style={styles.premiumDescription}>
          İlanınızın performansını görüntülemek için Premium'a geçin
        </Text>
        <Pressable 
          style={styles.upgradeButton}
          onPress={() => setShowPremiumModal(true)}
        >
          <Text style={styles.upgradeButtonText}>Premium'a Geç</Text>
        </Pressable>
        
        <PremiumModal 
          visible={showPremiumModal}
          onClose={closePremiumModal}
          feature={PREMIUM_FEATURES.ANALYTICS}
        />
      </View>
    );
  }

  return (
    <ScrollView>
      {/* Analytics dashboard */}
      <AnalyticsCard title="Görüntülenme" value={analyticsData?.views} />
      <AnalyticsCard title="Favori Eklenme" value={analyticsData?.favorites} />
      <AnalyticsCard title="Mesaj Alınma" value={analyticsData?.messages} />
    </ScrollView>
  );
}
```

### 5. Message Templates Integration

**File**: `app/chat/[userId].tsx` (to be enhanced)

**Premium Feature**: Pre-written message templates

**Implementation Example**:
```tsx
const MessageInput = () => {
  const { isPremium, checkPremiumAccess } = usePremiumGate();
  const [showTemplates, setShowTemplates] = useState(false);

  const handleTemplatesPress = () => {
    checkPremiumAccess(() => {
      setShowTemplates(true);
    });
  };

  return (
    <View style={styles.messageInput}>
      <TextInput style={styles.textInput} />
      
      <Pressable onPress={handleTemplatesPress} style={styles.templatesButton}>
        <MaterialIcons name="format-quote" size={20} color="#666" />
        {!isPremium && <View style={styles.premiumDot} />}
      </Pressable>
      
      <Pressable onPress={sendMessage} style={styles.sendButton}>
        <MaterialIcons name="send" size={20} color="white" />
      </Pressable>
    </View>
  );
};
```

## Database Schema Updates

### Listings Table Enhancement

```sql
-- Add premium features to listings table
ALTER TABLE public.listings 
ADD COLUMN is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN featured_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN view_count INTEGER DEFAULT 0,
ADD COLUMN favorite_count INTEGER DEFAULT 0,
ADD COLUMN message_count INTEGER DEFAULT 0;

-- Create analytics table
CREATE TABLE public.listing_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  favorites INTEGER DEFAULT 0,
  messages INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_listing_analytics_listing_date ON public.listing_analytics(listing_id, date);
CREATE INDEX idx_listings_featured ON public.listings(is_featured, featured_until);
```

### User Subscriptions Table

```sql
-- Track user premium subscriptions
CREATE TABLE public.user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  original_transaction_id TEXT UNIQUE NOT NULL,
  transaction_id TEXT NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_date TIMESTAMP WITH TIME ZONE,
  is_trial_period BOOLEAN DEFAULT FALSE,
  auto_renew_status BOOLEAN DEFAULT TRUE,
  receipt_data TEXT,
  environment TEXT CHECK (environment IN ('sandbox', 'production')),
  status TEXT CHECK (status IN ('active', 'expired', 'cancelled', 'grace_period')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_user_subscriptions_user ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status, expires_date);
CREATE UNIQUE INDEX idx_user_subscriptions_transaction ON public.user_subscriptions(original_transaction_id);
```

## App Store Connect Configuration

### Product Setup

1. **Premium Monthly** (eskici_premium_monthly)
   - Type: Auto-Renewable Subscription
   - Price: ₺29.99
   - Duration: 1 Month

2. **Premium Annual** (eskici_premium_annual)
   - Type: Auto-Renewable Subscription
   - Price: ₺299.99
   - Duration: 1 Year

3. **Listing Boost** (eskici_listing_boost)
   - Type: Consumable
   - Price: ₺9.99

### Localization

**Turkish (Turkey)**
- Premium Monthly: "Aylık Premium Üyelik"
- Premium Annual: "Yıllık Premium Üyelik" 
- Listing Boost: "İlan Öne Çıkarma"

## Testing Strategy

### Development Testing

1. **Sandbox Environment**
   ```bash
   # Test with sandbox Apple IDs
   # Test subscription flows
   # Test restore purchases
   ```

2. **Mock Premium State**
   ```tsx
   // For development, you can mock premium status
   const isDev = __DEV__;
   const mockPremium = isDev && process.env.MOCK_PREMIUM === 'true';
   
   const { isPremium: realIsPremium } = useInAppPurchases();
   const isPremium = mockPremium || realIsPremium;
   ```

### Production Testing

1. **TestFlight Beta**
   - Test with real App Store sandbox
   - Verify receipt validation
   - Test subscription management

2. **Gradual Rollout**
   - Start with 10% of users
   - Monitor conversion rates
   - A/B test pricing

## Implementation Checklist

### Phase 1: Core IAP System ✅
- [✅] IAP service implementation
- [✅] Premium gate hook
- [✅] Premium modal component
- [✅] Add listing premium features

### Phase 2: Feature Integration
- [ ] Search screen premium filters
- [ ] Profile verified badge
- [ ] Message templates
- [ ] Listing analytics

### Phase 3: Backend & Validation
- [ ] Supabase Edge Function for receipt validation
- [ ] Database schema updates
- [ ] Premium status sync

### Phase 4: App Store Setup
- [ ] App Store Connect products
- [ ] Subscription groups
- [ ] Pricing localization

### Phase 5: Testing & Launch
- [ ] TestFlight beta testing
- [ ] Analytics implementation
- [ ] Production release

## Revenue Optimization Tips

1. **Free Trial**: Offer 7-day free trial for annual subscription
2. **Feature Gating**: Show premium features with "try" buttons
3. **Social Proof**: Display user count, testimonials
4. **Urgency**: Limited-time offers, seasonal pricing
5. **Value Communication**: Clear before/after comparisons

## Support & Maintenance

### User Support
- Premium features documentation
- Subscription management help
- Billing issue resolution

### Monitoring
- Conversion rate tracking
- Feature usage analytics
- Subscription lifecycle metrics
- Churn analysis

---

This integration guide provides a complete roadmap for implementing premium features throughout the ESKICI marketplace app, ensuring a cohesive premium experience that drives revenue while maintaining excellent user experience.