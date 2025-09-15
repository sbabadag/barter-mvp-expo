# İMECE MARKETPLACE - CLIENT USER FLOW & USAGE GUIDE

## 📱 Complete User Journey Documentation

This document provides a comprehensive guide for testing and using the İmece Marketplace app as a client, covering all major user workflows and features.

---

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- Access to Supabase project credentials
- Test user accounts (created via `scripts/create-test-users.js`)

### Environment Setup
```bash
# Install dependencies
npm install

# Set up environment variables
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## 👤 USER AUTHENTICATION FLOW

### 1. Welcome Screen (`app/auth.tsx`)
**Entry Point**: First screen users see when opening the app

**User Actions**:
- **Sign Up**: Create new account
- **Log In**: Existing user login
- **Phone Login**: Alternative login method

**Test Scenarios**:
```javascript
// Test credentials (pre-created users)
Email: ahmet.yilmaz@email.com
Password: AhmetImece123!

Email: ayse.demir@email.com  
Password: AyseImece123!
```

### 2. Registration Process
**Required Fields**:
- ✅ Email* 
- ✅ Password* (min 8 chars, special chars)
- ✅ First Name*
- ✅ Last Name*
- City
- Phone (Turkish format: 0555 123 45 67)
- Birth Date (DD/MM/YYYY)
- Gender
- Address (optional)

**Validation Rules**:
- Email: Valid email format
- Phone: Turkish mobile format `^(\+90|0)?[5][0-9]{9}$`
- Birth Date: Must be in past, format DD/MM/YYYY
- Postal Code: 5 digits if provided

**Comments from Code**:
```tsx
// From auth.tsx line 80-118
// Email validation with regex
// Phone format validation for Turkish numbers
// Birth date validation with age restrictions
// Postal code must be 5 digits
```

### 3. Login Process
**Features**:
- Email/password login
- "Remember me" option (auto-login)
- Saved credentials loading
- Phone number login with SMS OTP

---

## 📋 MAIN APP FLOW (Tabs Navigation)

### Tab 1: Home/Feed (`app/(tabs)/index.tsx`)
**Purpose**: Browse and discover listings

**Features**:
- **Product Grid**: Modern card-based layout
- **Category Filtering**: Electronics, Fashion, Home, etc.
- **Search**: Text-based search across titles/descriptions
- **Refresh**: Pull-to-refresh functionality
- **New Badge**: Shows "NEW" for listings < 7 days old

**User Actions**:
1. Browse all listings
2. Filter by category
3. Search for specific items
4. Tap product to view details
5. Pull down to refresh

**Test Data Flow**:
```javascript
// Sample product display format
{
  id: "listing_id",
  title: "Product Name",
  price: 2500,
  currency: "TL",
  image_url: "photo_url",
  category: "Electronics",
  seller_name: "User Name",
  location: "İstanbul, Kadıköy",
  isNew: true,
  isSale: true
}
```

### Tab 2: Create Listing (`app/(tabs)/create.tsx`)
**Purpose**: Post new items for sale

**Required Information**:
- Title*
- Description*
- Price and currency
- Category selection
- Photos (up to multiple)
- Location
- Condition

**File Upload Process**:
- Image compression and optimization
- Supabase Storage integration
- Multiple photo support

### Tab 3: Messages (`app/(tabs)/messages.tsx`)
**Purpose**: Communication between users

**Features**:
- Chat conversations list
- Real-time messaging
- Message history
- User profile integration

**Chat Flow** (`app/chat/[userId].tsx`):
1. Select conversation from list
2. View message history
3. Send new messages
4. See listing context (if applicable)

### Tab 4: Profile (`app/(tabs)/profile.tsx`)
**Purpose**: User account management

**Editable Fields**:
- Display name
- Contact information
- Address details
- Profile photo
- Personal preferences

**Profile Management**:
```tsx
// From profile.tsx - editable form data structure
display_name, first_name, last_name, email, phone, city,
birth_date, gender, home_address, home_postal_code,
work_address, work_postal_code, avatar_url
```

---

## 💰 TRANSACTION FLOW

### 1. Listing Details (`app/listing/[id].tsx`)
**User Journey**:
1. Tap product from feed
2. View detailed information
3. See seller profile
4. Contact seller or make offer

### 2. Offer System
**Process**:
1. User views listing
2. Makes offer with message
3. Seller receives notification
4. Seller accepts/rejects offer
5. Transaction coordination

**Database Structure**:
```sql
-- Offers table structure
listing_id (UUID)
bidder_id (UUID) 
amount (numeric)
message (text)
status (pending/accepted/rejected)
created_at (timestamp)
```

### 3. Rating System (`RATING_SYSTEM_GUIDE.md`)
**Post-Transaction Flow**:
1. Transaction completed
2. Both parties can rate each other
3. Ratings affect user reputation
4. Comments provide detailed feedback

**Rating Components**:
- 1-5 star rating
- Written comment
- Transaction type (purchase/sale)
- Automatic aggregation into user stats

---

## 🧪 TESTING SCENARIOS

### A. Complete User Journey Test
```bash
# Run comprehensive client test
node client-app-test.js
```

### B. Authentication Testing
**Scenario 1**: New User Registration
1. Open app → Welcome screen
2. Tap "Hesap Oluştur" (Create Account)
3. Fill all required fields
4. Submit and verify account creation

**Scenario 2**: Existing User Login
1. Use test credentials
2. Verify "Remember me" functionality
3. Test auto-login behavior

### C. Core Functionality Testing
**Scenario 1**: Browse and Search
1. View product feed
2. Test category filters
3. Perform text searches
4. Verify product details

**Scenario 2**: Create Listing
1. Navigate to Create tab
2. Fill listing information
3. Upload photos
4. Publish listing
5. Verify in feed

**Scenario 3**: Messaging
1. Find another user's listing
2. Contact seller
3. Send messages
4. Verify real-time delivery

**Scenario 4**: Make Offer
1. Browse listings
2. Select item not owned by current user
3. Make reasonable offer
4. Verify offer submission

### D. Edge Case Testing
**Network Issues**:
- Test offline behavior
- Verify reconnection handling
- Test image upload failures

**Data Validation**:
- Invalid email formats
- Weak passwords
- Invalid phone numbers
- Future birth dates

**Empty States**:
- No listings available
- No messages
- No search results
- No offers

---

## 📊 DATABASE INTERACTION PATTERNS

### Real-time Features
```javascript
// Message real-time subscription pattern
supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages'
  }, payload => {
    // Handle new message
  })
  .subscribe()
```

### Data Fetching Patterns
```javascript
// Listings with seller information
const { data: listings } = await supabase
  .from('listings')
  .select(`
    *,
    seller:seller_id(display_name, avatar_url)
  `)
  .eq('is_active', true)
  .order('created_at', { ascending: false });
```

---

## 🔧 DEBUGGING & TROUBLESHOOTING

### Common Issues & Solutions

**1. Authentication Problems**
```bash
# Check current user status
node check-db.js
```

**2. Database Connection Issues**
- Verify Supabase credentials
- Check RLS policies
- Validate user permissions

**3. Image Upload Problems**
- Check Storage bucket permissions
- Verify file size limits
- Test network connectivity

### Logging & Monitoring
```javascript
// Enable debug logging in app
console.log('Auth Test - User:', user);
console.log('Auth Test - Is Authenticated:', isAuthenticated);
```

---

## 📱 MOBILE APP SPECIFIC FEATURES

### Platform Considerations
- **iOS**: Different keyboard behavior
- **Android**: Back button handling
- **Keyboard Avoidance**: Automatic form adjustment
- **Safe Areas**: Proper screen utilization

### Performance Optimizations
- Image compression before upload
- Lazy loading for large lists
- Efficient re-renders with React Query
- Background sync capabilities

---

## 🎯 TEST COMPLETION CHECKLIST

### Authentication ✅
- [ ] User registration works
- [ ] Login/logout functionality
- [ ] Remember me feature
- [ ] Profile updates

### Core Features ✅
- [ ] Browse listings
- [ ] Search and filter
- [ ] Create new listings
- [ ] Upload photos
- [ ] Send messages
- [ ] Make offers
- [ ] Rate users

### Edge Cases ✅
- [ ] Network interruption handling
- [ ] Invalid input validation
- [ ] Empty state displays
- [ ] Error message clarity

### Performance ✅
- [ ] App loads quickly
- [ ] Smooth scrolling
- [ ] Image loading efficient
- [ ] Real-time updates work

---

## 💡 USAGE COMMENTS FROM CODEBASE

### Key Implementation Notes:

1. **AuthProvider State Management** (`src/state/AuthProvider`):
   - Handles user authentication state
   - Manages auto-login with saved credentials
   - Provides user profile data globally

2. **Form Validation Patterns** (`app/auth.tsx`):
   ```tsx
   // Email validation
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   
   // Turkish phone validation
   /^(\+90|0)?[5][0-9]{9}$/
   
   // Date formatting
   const [, day, month, year] = dateMatch;
   formattedBirthDate = `${year}-${month}-${day}`;
   ```

3. **Real-time Messaging** (`app/chat/[userId].tsx`):
   - Supabase real-time subscriptions
   - Automatic message synchronization
   - User-to-user communication

4. **Image Handling** (Multiple files):
   - Compression before upload
   - Supabase Storage integration
   - Multiple photo support for listings

5. **Search Implementation** (`app/(tabs)/index.tsx`):
   - Category-based filtering
   - Text search across multiple fields
   - Real-time result updates

---

## 🚀 QUICK START FOR TESTING

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your Supabase credentials

# 3. Run client tests
node client-app-test.js

# 4. Start development server
npm run start

# 5. Test specific features
node test-offers.js        # Test offer system
node check-messages.js     # Test messaging
node check-db.js          # Check database
```

This comprehensive guide provides everything needed to test and understand the İmece Marketplace app from a client perspective, including real-world usage scenarios and troubleshooting information.
