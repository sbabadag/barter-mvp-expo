# İMECE MARKETPLACE - USAGE COMMENTS & CODE DOCUMENTATION

## 📝 Comprehensive Guide to Usage Comments Found in Codebase

This document compiles all usage comments, implementation notes, and instructions found throughout the İmece Marketplace codebase to provide developers and testers with essential implementation details.

---

## 🔐 AUTHENTICATION SYSTEM

### User Registration Validation (`app/auth.tsx`)

```tsx
// Email validation with comprehensive regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(formData.email)) {
  Alert.alert('Hata', 'Geçerli bir email adresi girin');
  return;
}

// Phone format validation specifically for Turkish numbers
if (formData.phone && !/^(\+90|0)?[5][0-9]{9}$/.test(formData.phone.replace(/\s/g, ''))) {
  Alert.alert('Hata', 'Geçerli bir Türkiye telefon numarası girin (örn: 0555 123 45 67)');
  return;
}

// Birth date format validation with future date prevention
if (formData.birthDate) {
  const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = formData.birthDate.match(dateRegex);
  
  if (!match) {
    Alert.alert('Hata', 'Doğum tarihi GG/AA/YYYY formatında olmalıdır (örn: 06/08/1975)');
    return;
  }
}
```

**Key Implementation Notes**:
- Email validation uses standard RFC-compliant regex
- Turkish phone numbers must start with 5 and be 11 digits total
- Birth dates are validated for format and logical constraints
- All validations include user-friendly Turkish error messages

### Password Security & User Metadata

```tsx
// Format birth date for database (convert DD/MM/YYYY to YYYY-MM-DD)
let formattedBirthDate = '';
if (formData.birthDate) {
  const dateMatch = formData.birthDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dateMatch) {
    const [, day, month, year] = dateMatch;
    formattedBirthDate = `${year}-${month}-${day}`;
  }
}

// User metadata structure for Supabase Auth
await signUp(formData.email, formData.password, {
  display_name: fullName,
  first_name: formData.firstName,
  last_name: formData.lastName,
  city: formData.city,
  phone: formData.phone,
  birth_date: formattedBirthDate || undefined,
  gender: formData.gender,
  home_address: formData.homeAddress || undefined,
  home_postal_code: formData.homePostalCode || undefined,
  work_address: formData.workAddress || undefined,
  work_postal_code: formData.workPostalCode || undefined,
});
```

---

## 🏠 MAIN APPLICATION FLOW

### Feed/Discovery Screen (`app/(tabs)/index.tsx`)

```tsx
// Convert listings data to standardized Product format for UI consistency
const convertToProducts = (listings: any[]): Product[] => {
  return listings.map(listingItem => ({
    id: listingItem.id,
    title: listingItem.title,
    price: listingItem.price,
    currency: listingItem.currency || 'TL',
    image_url: listingItem.image_url || '',
    category: listingItem.category,
    seller_name: listingItem.seller_name || ('user' + listingItem.id.slice(-2)),
    location: listingItem.location || 'İstanbul',
    created_at: listingItem.created_at || new Date().toISOString(),
    isNew: isNewListing(listingItem.created_at),
    isSale: !!listingItem.price,
  }));
};

// New listing badge logic - items less than 7 days old
const isNewListing = (createdAt: string) => {
  const created = new Date(createdAt);
  const now = new Date();
  const diffInDays = (now.getTime() - created.getTime()) / (1000 * 3600 * 24);
  return diffInDays <= 7; // Consider new if less than 7 days old
};
```

### Search and Filtering Logic

```tsx
// Advanced filtering with category and text search
const filteredData = useMemo(() => {
  if (!data) return [];

  let filtered = data;

  // Filter by category with partial matching
  if (selectedCategory !== 'All') {
    filtered = filtered.filter(item => {
      const itemCategory = item.category?.toLowerCase() || '';
      const selectedCat = selectedCategory.toLowerCase();
      return itemCategory.includes(selectedCat) || selectedCat.includes(itemCategory);
    });
  }

  // Filter by search query across title and category
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(item =>
      item.title?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query)
    );
  }

  return convertToProducts(filtered);
}, [data, selectedCategory, searchQuery]);
```

---

## 💬 MESSAGING SYSTEM

### Real-time Chat Implementation (`app/chat/[userId].tsx`)

```tsx
// Initialize chat with comprehensive user and listing context
const initializeChat = async () => {
  try {
    // Get current authenticated user
    const { data: currentUserData } = await supabase.auth.getUser();
    setCurrentUser(currentUserData.user);

    // Fetch other participant's profile information
    const { data: otherUserData } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('id', userId)
      .single();

    // Load listing context if provided
    if (listing) {
      const listingData = typeof listing === 'string' ? JSON.parse(listing) : listing;
      setListingInfo(listingData);
    }

    // Load existing message history
    await loadMessages();
  } catch (error) {
    console.error('Chat initialization error:', error);
  }
};
```

### Message Structure and Validation

```tsx
// Message validation and sending logic
const sendMessage = async () => {
  if (!newMessage.trim() || !currentUser || !userId) return;

  try {
    const messageData = {
      sender_id: currentUser.id,
      receiver_id: userId,
      content: newMessage.trim(),
      created_at: new Date().toISOString(),
      // Include listing context if applicable
      listing_id: listingInfo?.id || null
    };

    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select();

    if (!error) {
      setNewMessage(''); // Clear input after successful send
      await loadMessages(); // Refresh message list
    }
  } catch (error) {
    console.error('Message send error:', error);
  }
};
```

---

## 👤 PROFILE MANAGEMENT

### Profile Update Patterns (`app/(tabs)/profile.tsx`)

```tsx
// Comprehensive profile form data structure
const [formData, setFormData] = useState({
  display_name: user?.display_name || '',
  first_name: user?.first_name || '',
  last_name: user?.last_name || '',
  email: user?.email || '',
  phone: user?.phone || '',
  city: user?.city || '',
  birth_date: user?.birth_date || '',
  gender: user?.gender || '',
  home_address: user?.home_address || '',
  home_postal_code: user?.home_postal_code || '',
  work_address: user?.work_address || '',
  work_postal_code: user?.work_postal_code || '',
  avatar_url: user?.avatar_url || ''
});

// Profile update effect with proper dependency management
useEffect(() => {
  console.log('useEffect triggered - user changed:', user ? 'User exists' : 'User is null');
  if (user) {
    console.log('User data loaded, updating formData with:', {
      display_name: user.display_name,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      city: user.city
    });
    
    const newFormData = {
      display_name: user.display_name || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone || '',
      city: user.city || '',
      birth_date: user.birth_date || '',
      gender: user.gender || '',
      home_address: user.home_address || '',
      home_postal_code: user.home_postal_code || '',
      work_address: user.work_address || '',
      work_postal_code: user.work_postal_code || '',
      avatar_url: user.avatar_url || ''
    };
    
    console.log('Setting formData to:', newFormData);
    setFormData(newFormData);
    console.log('FormData updated successfully');
  } else {
    console.log('User is null/undefined, user data not loaded yet');
  }
}, [user]);
```

---

## 🧪 TESTING INFRASTRUCTURE

### Database Testing Patterns (`check-db.js`)

```javascript
// Comprehensive table structure verification
async function checkTables() {
  console.log('🔍 Checking database tables...\n');
  
  try {
    // Standard pattern for checking table existence and structure
    console.log('📋 Checking listings table...');
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('*')
      .limit(1);
    
    if (listingsError) {
      console.log('❌ Listings table error:', listingsError.message);
    } else {
      console.log('✅ Listings table exists');
      if (listings && listings.length > 0) {
        console.log('Columns:', Object.keys(listings[0]));
      }
    }
  } catch (error) {
    console.error('❌ Database check failed:', error);
  }
}
```

### User Creation for Testing (`scripts/create-test-users.js`)

```javascript
// Test user creation with comprehensive metadata
async function createTestUsers() {
  console.log('🚀 İmece Marketplace test kullanıcıları oluşturuluyor...');
  console.log('');
  
  for (const user of testUsers) {
    try {
      // Create auth user with admin privileges
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Skip email verification for testing
        user_metadata: {
          display_name: user.name,
          city: user.city
        }
      });

      if (authError) {
        console.error(`❌ ${user.name} kullanıcısı oluşturulamadı:`, authError.message);
        continue;
      }

      console.log(`✅ ${user.name} başarıyla oluşturuldu`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔑 Password: ${user.password}`);
      console.log(`   🆔 User ID: ${authData.user.id}`);
      console.log('');
    } catch (error) {
      console.error(`❌ Error creating user ${user.name}:`, error);
    }
  }
}
```

---

## 🎯 RATING SYSTEM

### Rating Data Validation (`check_ratings.js`)

```javascript
// Rating statistics verification with manual calculation cross-check
async function checkRatings() {
  console.log('🔍 Checking rating data consistency...\n');

  try {
    // Verify automated rating statistics
    const { data: stats, error: statsError } = await supabase
      .from('user_rating_stats')
      .select('*')
      .limit(5);

    // Display comprehensive rating breakdown
    stats.forEach(stat => {
      console.log(`User: ${stat.user_id}`);
      console.log(`  Overall: ${stat.average_rating} (${stat.total_reviews} reviews)`);
      console.log(`  Seller: ${stat.seller_average_rating} (${stat.seller_total_reviews} reviews)`);
      console.log(`  Buyer: ${stat.buyer_average_rating} (${stat.buyer_total_reviews} reviews)`);
      console.log('---');
    });

    // Cross-validation with manual calculation
    const { data: manualCalc } = await supabase
      .from('ratings')
      .select('reviewed_user_id, rating, transaction_type');

    if (manualCalc) {
      console.log('\n🧮 Manual Average Calculation:');
      const userRatings = {};
      
      manualCalc.forEach(rating => {
        if (!userRatings[rating.reviewed_user_id]) {
          userRatings[rating.reviewed_user_id] = {
            all: [],
            seller: [],
            buyer: []
          };
        }
        userRatings[rating.reviewed_user_id].all.push(rating.rating);
        userRatings[rating.reviewed_user_id][rating.transaction_type].push(rating.rating);
      });
    }
  } catch (error) {
    console.error('Rating check failed:', error);
  }
}
```

---

## 🔧 TESTING UTILITIES

### Offer Testing Structure (`test-offers.js`)

```javascript
// Dynamic offer testing with error analysis
async function testOfferCreation() {
  console.log('🧪 Testing offer creation to understand table structure...\n');
  
  try {
    // Verify authenticated user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.log('❌ No authenticated user found');
      return;
    }

    console.log('✅ Authenticated user:', userData.user.id);

    // Find suitable listing for testing
    const { data: listings } = await supabase
      .from('listings')
      .select('*')
      .limit(1);

    if (!listings || listings.length === 0) {
      console.log('❌ No listings found for testing');
      return;
    }

    console.log('✅ Found listing for testing:', listings[0].id);

    // Test offer structure discovery
    const testOffer = {
      listing_id: listings[0].id,
      message: 'Test offer message',
      created_at: new Date().toISOString()
    };

    console.log('📝 Attempting to create test offer...');
    
    const { data, error } = await supabase
      .from('offers')
      .insert(testOffer)
      .select();

    if (error) {
      console.log('❌ Error creating offer:', error.message);
      console.log('💡 This tells us the required fields...');
    } else {
      console.log('✅ Test offer created successfully!');
      console.log('📊 Offer structure:', data[0] ? Object.keys(data[0]) : 'No data returned');
      
      // Clean up test data
      if (data && data[0]) {
        await supabase.from('offers').delete().eq('id', data[0].id);
        console.log('🧹 Test offer cleaned up');
      }
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}
```

---

## 📱 MOBILE PLATFORM SPECIFICS

### Keyboard and UI Adaptations (`app/auth.tsx`)

```tsx
// Platform-specific keyboard avoidance
<KeyboardAvoidingView 
  style={styles.container} 
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
>
  <ScrollView contentContainerStyle={styles.scrollContainer}>
    {/* Form content */}
  </ScrollView>
</KeyboardAvoidingView>

// Auto-formatting for user input fields
<TextInput
  style={styles.input}
  placeholder="Doğum Tarihi (GG/AA/YYYY örn: 06/08/1975)"
  value={formData.birthDate}
  onChangeText={(text) => {
    // Auto-format the date input
    let formatted = text.replace(/\D/g, ''); // Remove non-digits
    if (formatted.length >= 2) {
      formatted = formatted.substring(0, 2) + '/' + formatted.substring(2);
    }
    if (formatted.length >= 5) {
      formatted = formatted.substring(0, 5) + '/' + formatted.substring(5, 9);
    }
    setFormData({...formData, birthDate: formatted});
  }}
  keyboardType="numeric"
  maxLength={10}
/>
```

---

## 🔍 DEBUGGING AND MONITORING

### Authentication State Debugging (`src/components/AuthTest.tsx`)

```tsx
// Comprehensive auth state debugging
export default function AuthTest() {
  const { user, isAuthenticated, refresh } = useAuth();

  useEffect(() => {
    console.log('Auth Test - User:', user);
    console.log('Auth Test - Is Authenticated:', isAuthenticated);
    checkAndCreateUser();
  }, []);

  const checkAndCreateUser = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('mock_user');
      console.log('Saved user in AsyncStorage:', savedUser);
      
      if (!savedUser) {
        console.log('No user found, creating test user...');
        await createTestUser();
      }
    } catch (error) {
      console.error('Error checking user:', error);
    }
  };
}
```

### Profile State Management Debug Logging

```tsx
// Debug logging for profile state changes
console.log('ProfileTab render - user:', user ? 'User loaded' : 'User is null');
console.log('ProfileTab render - isLoading:', isLoading);
if (user) {
  console.log('User data details:', {
    id: user.id,
    display_name: user.display_name,
    first_name: user.first_name,
    email: user.email
  });
}
```

---

## 📊 APP STORE SUBMISSION NOTES

### Testing Guidelines (`APP_STORE_CONNECT_SETUP_GUIDE.md`)

```markdown
Review Notes (for Apple reviewers):
This is a local marketplace app for Turkish communities where neighbors can buy and sell second-hand items. 

Test Account (if needed):
Email: test@example.com
Password: TestPassword123

Key Features to Test:
1. Browse listings without account
2. Create account and verify email
3. Post a listing with photos
4. Search and filter listings
5. Send messages between users
6. View user profiles and ratings

The app promotes environmental sustainability through reuse and strengthens community connections.
```

### Pre-Submission Testing Checklist (`APP_STORE_COMPLIANCE_CHECKLIST.md`)

```markdown
Test Scenarios:
1. Account Creation
   - [ ] User registration works
   - [ ] Email verification (if used)
   - [ ] Profile setup

2. Core Functionality
   - [ ] Create listing with photos
   - [ ] Search and browse listings
   - [ ] Send/receive messages
   - [ ] Location selection

3. Edge Cases
   - [ ] No internet connection
   - [ ] Empty states (no listings, no messages)
   - [ ] Image upload failures
   - [ ] Large datasets
```

---

## 🚀 QUICK REFERENCE FOR DEVELOPERS

### Essential Testing Commands

```bash
# Database structure verification
node check-db.js

# User authentication testing  
node check-messages.js

# Offer system testing
node test-offers.js

# Rating system verification
node check_ratings.js

# Create test users
node scripts/create-test-users.js

# Full client-side testing
node client-app-test.js
```

### Common Debug Patterns

1. **Authentication Issues**: Check user state in AsyncStorage and Supabase auth
2. **Database Problems**: Verify RLS policies and table permissions
3. **Form Validation**: Test with edge cases and invalid inputs
4. **Real-time Features**: Monitor Supabase realtime subscriptions
5. **Image Uploads**: Check Storage bucket permissions and file sizes

---

## 💡 BEST PRACTICES FROM CODEBASE

### Error Handling Patterns

```tsx
// Consistent error handling with user feedback
try {
  const result = await apiCall();
  if (result.error) {
    Alert.alert('Hata', result.error.message);
    return;
  }
  // Success handling
} catch (error) {
  console.error('Operation failed:', error);
  Alert.alert('Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.');
}
```

### State Management Patterns

```tsx
// Loading states for better UX
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async () => {
  setIsLoading(true);
  try {
    await performOperation();
  } finally {
    setIsLoading(false);
  }
};
```

### Form Input Validation

```tsx
// Real-time input formatting and validation
onChangeText={(text) => {
  // Format input as user types
  const formatted = formatInput(text);
  setFormData({...formData, field: formatted});
}}
```

This comprehensive documentation provides developers with all the essential usage comments, implementation patterns, and testing guidelines found throughout the İmece Marketplace codebase.
