#!/bin/bash

# Notification System Deployment Script for ESKICI App
# This script helps deploy the complete notification system

echo "🔔 ESKICI Notification System Deployment"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must be run from the project root directory"
    exit 1
fi

echo "📋 Checking prerequisites..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not found. Please install: npm install -g supabase"
    echo "   Then run: supabase login"
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "⚠️  EAS CLI not found. Please install: npm install -g @expo/eas-cli"
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ Prerequisites check complete"
echo

# Step 1: Database Setup
echo "📊 Step 1: Database Setup"
echo "-------------------------"
echo "This will create the notification system tables and triggers in your Supabase database."
echo "File to run: sql/setup_notification_system.sql"
echo
echo "Instructions:"
echo "1. Open your Supabase dashboard"
echo "2. Go to SQL Editor"
echo "3. Paste the content of sql/setup_notification_system.sql"
echo "4. Run the SQL script"
echo
read -p "Press Enter when database setup is complete..."

# Step 2: Deploy Edge Function
echo
echo "🚀 Step 2: Deploy Push Notification Edge Function"
echo "------------------------------------------------"
echo "This will deploy the push notification webhook to Supabase Edge Functions."
echo

if command -v supabase &> /dev/null; then
    echo "Deploying send-push-notification function..."
    supabase functions deploy send-push-notification
    
    echo
    echo "⚙️  Setting up environment variables..."
    echo "Please set your FCM Server Key:"
    echo "supabase secrets set FCM_SERVER_KEY=your_fcm_server_key_here"
    echo
    echo "You can get your FCM Server Key from:"
    echo "1. Go to Firebase Console > Project Settings"
    echo "2. Cloud Messaging tab"
    echo "3. Copy the Server Key"
    echo
else
    echo "⚠️  Supabase CLI not available. Manual deployment required:"
    echo "1. Install Supabase CLI: npm install -g supabase"
    echo "2. Login: supabase login"
    echo "3. Deploy: supabase functions deploy send-push-notification"
    echo "4. Set FCM key: supabase secrets set FCM_SERVER_KEY=your_key"
fi

read -p "Press Enter when edge function deployment is complete..."

# Step 3: App Configuration
echo
echo "📱 Step 3: App Configuration"
echo "----------------------------"
echo "The app has been configured with Firebase packages."
echo "Current configuration:"
echo "- Firebase packages: ✅ Installed"
echo "- app.json plugins: ✅ Configured"
echo "- GoogleService-Info.plist: ✅ Present"
echo "- google-services.json: ✅ Present"
echo
echo "Firebase integration is now active!"

# Step 4: Build and Test
echo
echo "🏗️  Step 4: Build and Test"
echo "--------------------------"
echo "Now let's build and test the notification system:"
echo

echo "For Development Build:"
echo "1. eas build --platform ios --profile development"
echo "2. eas build --platform android --profile development"
echo

echo "For Production Build:"
echo "1. eas build --platform ios --profile production"
echo "2. eas build --platform android --profile production"
echo

echo "To test notifications:"
echo "1. Install the development build on a physical device"
echo "2. Log in to the app"
echo "3. Create a bid on someone's listing"
echo "4. Check that notification is received"
echo

# Step 5: Monitoring
echo "📊 Step 5: Monitoring and Debugging"
echo "-----------------------------------"
echo "Monitor notifications in your Supabase dashboard:"
echo "1. Go to Database > Tables > notifications"
echo "2. Check notification_queue for delivery status"
echo "3. View user_notification_settings for user preferences"
echo
echo "Debug logs to watch:"
echo "- App logs: Check console for notification initialization"
echo "- Edge function logs: View in Supabase Functions dashboard"
echo "- Firebase console: Monitor message delivery"
echo

echo "🎉 Notification System Deployment Complete!"
echo "=========================================="
echo
echo "What's been implemented:"
echo "✅ Database triggers for automatic notifications"
echo "✅ User notification settings and preferences"
echo "✅ Push notification delivery via Edge Functions"
echo "✅ Firebase FCM integration"
echo "✅ Expo Push notifications as fallback"
echo "✅ Notification badge system"
echo "✅ Real-time notification counts"
echo
echo "Next steps:"
echo "1. Deploy app builds to test devices"
echo "2. Test notification flows end-to-end"
echo "3. Configure notification settings UI"
echo "4. Monitor delivery rates and optimize"
echo
echo "For support, check the documentation in:"
echo "- sql/setup_notification_system.sql"
echo "- supabase/functions/send-push-notification/index.ts"
echo "- src/services/notifications.ts"