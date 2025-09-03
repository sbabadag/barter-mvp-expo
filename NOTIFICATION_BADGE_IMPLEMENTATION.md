# Notification Badge Implementation

## Overview
This implementation adds a notification badge next to the search button in the main feed screen (`app/(tabs)/index.tsx`) that shows the count of pending offers and bids.

## Features
✅ **Real-time Notification Count**: Shows total unread notifications  
✅ **Smart Badge Display**: Only shows when count > 0  
✅ **Visual Appeal**: Orange badge with white text matching app theme  
✅ **Tap to Navigate**: Tapping the notification icon navigates to Tekliflerim screen  
✅ **Auto-refresh**: Updates every 30 seconds for real-time updates  

## Components Added

### 1. NotificationBadge Component (`src/components/NotificationBadge.tsx`)
- Reusable badge component with customizable size, color, and position
- Handles counts > 99 with "99+" display
- Positioned as absolute overlay on parent element
- Includes shadow and border for better visibility

### 2. Notification Service (`src/services/notifications.ts`)
- Tracks pending received offers (new bids on user's listings)
- Uses React Query for caching and auto-refresh
- Integrates with existing `useReceivedOffers` hook
- Expandable for future notification types (messages, etc.)

## What Gets Counted

### Current Notifications:
- **Pending Offers**: New bids received on user's listings with status 'pending' or 'countered'

### Future Expandable:
- **New Messages**: Direct messages between users
- **Bid Updates**: Status changes on user's submitted bids
- **System Notifications**: App updates, promotions, etc.

## UI Layout Changes

### Before:
```
[Search Input with icon] [Clear button]
```

### After:
```
[Search Input with icon] [Clear button]  [🔔 Badge]
```

The notification button is positioned to the right of the search bar with:
- Bell icon using Ionicons `notifications-outline`
- Orange badge (`#f0a500`) matching app's accent color
- Proper spacing and padding for touch interaction

## Technical Details

### Integration Points:
1. **Search Section**: Modified to include notification button in a row layout
2. **Auth Integration**: Only shows for authenticated users
3. **Navigation**: Taps navigate to existing Tekliflerim screen
4. **State Management**: Uses existing React Query setup

### Performance:
- Leverages existing offer data (no additional API calls)
- Smart caching with React Query
- Conditional rendering (no badge when count is 0)

## Usage Examples

### High Priority Notifications:
- User receives new bid: Badge shows "1"
- Multiple pending offers: Badge shows "3"
- Counter offers: Badge shows total pending + countered

### User Interaction:
1. User sees orange badge with "2" 
2. Taps notification icon
3. Navigates to Tekliflerim screen
4. Views "Gelen Teklifler" tab
5. Badge disappears after viewing

## Future Enhancements

### Easy Additions:
- Add message notifications count
- Include different notification types
- Push notifications integration
- Badge color coding by priority

### Advanced Features:
- Mark notifications as read
- Notification history
- Sound/vibration alerts
- Notification preferences

The system is designed to be easily extensible for additional notification types while maintaining good performance and user experience.
