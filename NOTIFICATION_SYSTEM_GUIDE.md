# 🔔 ESKICI Notification System Documentation

A comprehensive push notification system built with Supabase, Firebase FCM, and Expo for the ESKICI marketplace app.

## 📋 Overview

The notification system provides real-time push notifications for:
- 🎯 **New Bids**: When someone bids on your listing
- ✅ **Bid Responses**: When seller accepts/rejects/counters your bid  
- 💬 **New Messages**: When you receive a message
- 🎉 **Listing Updates**: When your item sells
- ⏰ **Reminders**: Custom scheduled notifications

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │    Supabase     │    │    Firebase     │
│                 │    │                 │    │                 │
│ • Expo Push     │◄──►│ • Database      │◄──►│ • FCM Service   │
│ • Firebase FCM  │    │ • Edge Functions│    │ • Message Queue │
│ • Local Notifs  │    │ • Triggers      │    │ • Delivery      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Components:

1. **Database Layer** (`sql/setup_notification_system.sql`)
   - `notifications` table: Stores all notifications
   - `user_notification_settings` table: User preferences
   - Database triggers: Auto-create notifications on bid/message events
   - RLS policies: Secure data access

2. **Edge Function** (`supabase/functions/send-push-notification/index.ts`)
   - Webhook for sending push notifications
   - Supports both Firebase FCM and Expo Push
   - Handles delivery retries and error logging

3. **App Integration** (`src/services/notifications.ts`)
   - NotificationService class: Manages tokens and local notifications
   - React hooks: useNotificationCounts, useUserNotifications
   - Firebase integration: Token management and message handling

## 🚀 Setup Instructions

### 1. Database Setup

Run the SQL setup script in your Supabase dashboard:

```bash
# In Supabase SQL Editor, paste and run:
cat sql/setup_notification_system.sql
```

This creates:
- Notification tables and triggers
- User settings management
- Automatic notification generation

### 2. Deploy Edge Function

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Deploy the push notification function
supabase functions deploy send-push-notification

# Set your Firebase Server Key
supabase secrets set FCM_SERVER_KEY=your_firebase_server_key
```

### 3. App Configuration

The app is already configured with:
- Firebase packages installed
- app.json plugins configured
- GoogleService-Info.plist and google-services.json in place

### 4. Build and Deploy

```bash
# Development build
eas build --platform ios --profile development
eas build --platform android --profile development

# Production build
eas build --platform ios --profile production
eas build --platform android --profile production
```

## 📊 Database Schema

### notifications table
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES auth.users(id)
type VARCHAR(50) -- 'new_bid', 'bid_accepted', etc.
title TEXT
body TEXT
data JSONB -- Additional notification data
read BOOLEAN DEFAULT FALSE
sent BOOLEAN DEFAULT FALSE
listing_id UUID (optional)
bid_id UUID (optional)
message_id UUID (optional)
created_at TIMESTAMP
sent_at TIMESTAMP
read_at TIMESTAMP
```

### user_notification_settings table
```sql
user_id UUID REFERENCES auth.users(id)
push_enabled BOOLEAN DEFAULT TRUE
push_new_bids BOOLEAN DEFAULT TRUE
push_bid_responses BOOLEAN DEFAULT TRUE
push_new_messages BOOLEAN DEFAULT TRUE
push_listing_updates BOOLEAN DEFAULT TRUE
email_enabled BOOLEAN DEFAULT FALSE
quiet_hours_start TIME DEFAULT '22:00'
quiet_hours_end TIME DEFAULT '08:00'
timezone VARCHAR(50) DEFAULT 'Europe/Istanbul'
```

## 🔧 API Usage

### React Hooks

```typescript
// Get notification counts for badges
const { data: counts } = useNotificationCounts();
console.log(counts.total); // Total unread notifications

// Get user notifications
const { data: notifications } = useUserNotifications(50);

// Mark notifications as read
const { markAsRead } = useMarkNotificationsRead();
await markAsRead(['notification-id-1', 'notification-id-2']);

// Get notification settings
const { data: settings } = useNotificationSettings();

// Update notification settings
const { updateSettings } = useUpdateNotificationSettings();
await updateSettings({ push_new_bids: false });
```

### Database Functions

```sql
-- Get notification counts
SELECT * FROM get_notification_counts('user-uuid');

-- Mark notifications as read
SELECT mark_notifications_read('user-uuid', ARRAY['notif-id-1'], NULL);

-- Create a custom notification
SELECT create_notification(
  'user-uuid',
  'reminder',
  'Don\'t forget!',
  'You have pending bids to review',
  '{"type": "reminder"}'::jsonb
);
```

### Push Notification Webhook

```typescript
// Call from TypeScript
const { data } = await supabase.functions.invoke('send-push-notification', {
  body: {
    user_id: 'user-uuid',
    title: 'New Bid!',
    body: 'You received a bid on your iPhone',
    data: { type: 'new_bid', bid_id: 'bid-uuid' },
    fcm_token: 'user-fcm-token',
    expo_token: 'user-expo-token'
  }
});
```

## 🎯 Notification Types

| Type | Description | Trigger | Data |
|------|-------------|---------|------|
| `new_bid` | Someone bid on your listing | INSERT INTO bids | bid_id, listing_id, amount |
| `bid_accepted` | Your bid was accepted | UPDATE bids SET status='accepted' | bid_id, listing_id |
| `bid_rejected` | Your bid was rejected | UPDATE bids SET status='rejected' | bid_id, listing_id |
| `bid_countered` | Seller made counter offer | UPDATE bids SET status='countered' | bid_id, counter_amount |
| `new_message` | New chat message | INSERT INTO messages | message_id, sender_id |
| `listing_sold` | Your listing sold | UPDATE listings SET status='sold' | listing_id, final_price |
| `reminder` | Custom reminder | Manual/scheduled | custom_data |

## 🔔 Notification Channels (Android)

- **bids**: High priority, vibration, sound (bids/offers)
- **messages**: Default priority, sound (chat messages)  
- **general**: Default priority (other notifications)

## 🛠️ Troubleshooting

### Common Issues

1. **No notifications received**
   - Check if Firebase packages are installed: `npm list @react-native-firebase`
   - Verify GoogleService-Info.plist and google-services.json are present
   - Check device permissions in Settings > Notifications
   - Verify FCM_SERVER_KEY is set in Supabase secrets

2. **Database triggers not firing**
   - Check if SQL setup script ran successfully
   - Verify RLS policies allow system to insert notifications
   - Check Supabase logs for trigger errors

3. **Edge function failing**
   - Check function logs in Supabase dashboard
   - Verify FCM_SERVER_KEY environment variable
   - Test function directly via REST API

### Debug Logs

Enable debug logging:
```typescript
// In NotificationService.initialize()
console.log('🔥 Firebase available:', isFirebaseAvailable());
console.log('📱 FCM Token:', await getFCMToken());
console.log('📱 Expo Token:', expoPushToken);
```

### Testing Notifications

1. **Test local notifications** (works in simulator):
```typescript
await notificationService.scheduleBidNotification('Test Item', 100, 'test-id');
```

2. **Test database notifications** (requires real device):
```sql
-- Create test notification in Supabase SQL editor
SELECT create_notification(
  'your-user-id',
  'new_bid',
  'Test Notification',
  'This is a test from the database',
  '{"test": true}'::jsonb
);
```

3. **Test push delivery** (requires real device):
```bash
# Call edge function directly
curl -X POST 'https://your-project.supabase.co/functions/v1/send-push-notification' \
-H 'Authorization: Bearer your-anon-key' \
-H 'Content-Type: application/json' \
-d '{
  "user_id": "user-uuid",
  "title": "Test Push",
  "body": "Direct push test",
  "fcm_token": "your-fcm-token"
}'
```

## 📈 Monitoring

### Database Monitoring
- Monitor `notifications` table for notification creation
- Check `notification_queue` for delivery status
- Track `user_notification_settings` adoption

### Analytics Queries
```sql
-- Notification delivery rates
SELECT 
  type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE sent = true) as sent,
  ROUND(COUNT(*) FILTER (WHERE sent = true) * 100.0 / COUNT(*), 2) as delivery_rate
FROM notifications 
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY type;

-- User engagement with notifications
SELECT 
  COUNT(*) FILTER (WHERE read = true) as read_notifications,
  COUNT(*) as total_notifications,
  ROUND(COUNT(*) FILTER (WHERE read = true) * 100.0 / COUNT(*), 2) as read_rate
FROM notifications 
WHERE created_at > NOW() - INTERVAL '7 days';
```

## 🔒 Security

- **RLS Policies**: Users can only see their own notifications
- **Token Storage**: Push tokens stored in auth.users metadata
- **Edge Function**: Authenticated via Supabase service key
- **Firebase**: Server key stored as Supabase secret

## 🚀 Performance

- **Indexing**: Optimized indexes on user_id, type, read, created_at
- **Batching**: Notifications queued for batch delivery
- **Cleanup**: Automatic cleanup of old notifications (30 days)
- **Caching**: React Query caches notification counts and lists

## 📝 Future Enhancements

- [ ] Email notifications for important events
- [ ] SMS notifications for critical alerts
- [ ] Rich notifications with images and actions
- [ ] Notification scheduling and automation
- [ ] A/B testing for notification content
- [ ] Webhook integrations for external services
- [ ] Real-time notification feeds
- [ ] Push notification analytics dashboard

## 🆘 Support

For issues and questions:
1. Check troubleshooting section above
2. Review database logs in Supabase dashboard
3. Check edge function logs
4. Verify Firebase console for delivery status
5. Test with both development and production builds

The notification system is designed to be robust and fall back gracefully when services are unavailable.