# Default Address Auto-Population Feature

## 📍 Overview

Added automatic default address population functionality to the "Yeni İlan" (Add New Listing) form. When users interact with the location field, their saved address information is automatically populated to improve user experience.

## ✨ Features

### 1. **Automatic Population on Focus**
- When user taps the location picker for the first time (empty field)
- Automatically fills with user's saved address information
- Provides haptic feedback and user notification

### 2. **Address Priority System**
- **First Priority**: Home address (`user.home_address`)
- **Second Priority**: Work address (`user.work_address`) 
- **Third Priority**: City (`user.city`)

### 3. **Manual Default Address Button**
- Always available when user has saved address information
- Allows users to populate default address at any time
- Shows home icon and clear label: "Varsayılan adresimi kullan"

## 🛠️ Technical Implementation

### Modified Files

#### `app/add-listing.tsx`
- Added `useAuth` hook import from `../src/state/AuthProvider`
- Added `populateDefaultAddress()` function with user feedback
- Enhanced LocationPicker with `onFocus` prop
- Added manual default address button with styling
- Added haptic feedback and alert notifications

#### `src/components/LocationPickerSimple.tsx`
- Extended `LocationPickerProps` interface with optional `onFocus` callback
- Modified Pressable component to trigger `onFocus` when modal opens
- Maintains backward compatibility with existing usage

### Code Structure

```typescript
// Auto-populate function with priority system
const populateDefaultAddress = () => {
  if (user && !location.trim()) {
    const defaultAddress = user.home_address || user.work_address || user.city || '';
    if (defaultAddress) {
      setLocation(defaultAddress);
      // Provide user feedback
      HapticService.light();
      // Show informative alert
    }
  }
};

// Enhanced LocationPicker usage
<LocationPicker
  onLocationSelect={handleLocationSelect}
  selectedLocation={location}
  label="Konum"
  onFocus={populateDefaultAddress}
/>

// Manual trigger button
{user && (user.home_address || user.work_address || user.city) && (
  <Pressable style={styles.defaultAddressButton} onPress={...}>
    <MaterialIcons name="home" size={16} color="#007AFF" />
    <Text>Varsayılan adresimi kullan</Text>
  </Pressable>
)}
```

## 🎯 User Experience

### 1. **Seamless Auto-Population**
- Users tap location field → Default address appears automatically
- No extra steps required for users with saved addresses
- Clear feedback about what happened

### 2. **User Control**
- Manual button always available for immediate access
- Can override auto-populated address with location picker
- Non-intrusive design that doesn't interfere with normal flow

### 3. **Address Types Feedback**
- Alert shows which type of address was loaded:
  - "Ev adresi otomatik olarak dolduruldu"
  - "İş adresi otomatik olarak dolduruldu"  
  - "Şehir otomatik olarak dolduruldu"

## 🔗 Database Integration

Uses existing user profile schema:
- `profiles.home_address` - Primary default address
- `profiles.work_address` - Secondary default address  
- `profiles.city` - Fallback location

## 🎨 Styling

### Default Address Button
- Light blue background (`#f0f8ff`)
- Blue border and text (`#007AFF`)
- Home icon for visual recognition
- Compact size to not overwhelm the form

## 🚀 Benefits

1. **Faster Listing Creation** - Pre-filled addresses save user time
2. **Better UX** - Reduces form friction for repeat users
3. **Smart Defaults** - Logical priority system for address selection
4. **User Choice** - Manual override always available
5. **Profile Integration** - Leverages existing user data

## 🔄 Backward Compatibility

- New `onFocus` prop is optional in LocationPicker
- Existing LocationPicker usage continues to work unchanged
- Feature only activates when user has saved address data
- Web platform continues to use LocationPickerWeb without changes

## 📱 Platform Support

- **Mobile (iOS/Android)**: Full feature support with LocationPickerSimple
- **Web**: Continues to use existing LocationPickerWeb (no auto-population)

## 🧪 Testing Notes

Test scenarios:
1. New user with no saved addresses → No auto-population
2. User with home address → Home address auto-populates
3. User with only work address → Work address auto-populates  
4. User with only city → City auto-populates
5. Manual button functionality → Works at any time
6. Location already filled → Auto-population skipped
7. User changes address → Can still use manual button

---

*Feature implemented with hot reload support - changes are immediately visible during development.*