#!/bin/bash

# TestFlight Deployment Script for ESKICI iOS App
# Version: 1.2.0 - Notification System Update

echo "🚀 Starting TestFlight deployment for ESKICI iOS App"
echo "=================================================="

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g @expo/eas-cli
fi

# Login to EAS (if not already logged in)
echo "🔐 Checking EAS authentication..."
eas whoami || eas login

# Clear any previous builds
echo "🧹 Cleaning up previous builds..."
rm -rf .expo/

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Pre-build checks
echo "🔍 Running pre-build checks..."

# Check if Firebase config exists
if [ ! -f "GoogleService-Info.plist" ]; then
    echo "❌ Error: GoogleService-Info.plist not found!"
    echo "Please add your Firebase iOS configuration file."
    exit 1
fi

# Check if all required notification files exist
REQUIRED_FILES=(
    "src/services/notifications.ts"
    "src/services/advancedNotifications.ts"
    "app/notification-settings.tsx"
    "app/notifications.tsx"
    "sql/setup_notification_system.sql"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Error: Required file $file not found!"
        exit 1
    fi
done

echo "✅ All notification system files are present"

# Validate app.json configuration
echo "🔍 Validating app configuration..."
node -e "
const appJson = require('./app.json');
const expo = appJson.expo;

// Check version
console.log('📱 App Version:', expo.version);

// Check iOS config
if (!expo.ios.bundleIdentifier) {
    console.error('❌ iOS bundle identifier missing');
    process.exit(1);
}

// Check notification permissions
if (!expo.ios.infoPlist.NSUserNotificationsUsageDescription) {
    console.error('❌ Notification permission description missing');
    process.exit(1);
}

// Check Firebase plugin
const firebasePlugin = expo.plugins.find(p => 
    Array.isArray(p) && p[0] === '@react-native-firebase/app'
);
if (!firebasePlugin) {
    console.error('❌ Firebase plugin not configured');
    process.exit(1);
}

console.log('✅ App configuration is valid');
"

if [ $? -ne 0 ]; then
    echo "❌ App configuration validation failed"
    exit 1
fi

# Build for TestFlight (production profile)
echo "🏗️  Building iOS app for TestFlight..."
echo "This may take 10-15 minutes..."

eas build --platform ios --profile production --auto-submit

# Check build status
if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 BUILD SUCCESSFUL!"
    echo "=================="
    echo ""
    echo "📱 Your iOS app has been built and submitted to TestFlight!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Check your email for App Store Connect notifications"
    echo "2. Log into App Store Connect (https://appstoreconnect.apple.com/)"
    echo "3. Go to TestFlight section"
    echo "4. Add internal testers"
    echo "5. Distribute the build for testing"
    echo ""
    echo "🔔 Notification System Features Included:"
    echo "• Server-side automatic notifications"
    echo "• Direct bid accept/reject from notifications"
    echo "• Rich notification categories"
    echo "• User notification preferences"
    echo "• Firebase FCM integration"
    echo "• Comprehensive badge system"
    echo ""
    echo "🧪 Testing Instructions:"
    echo "1. Install from TestFlight"
    echo "2. Navigate to /test-notifications in app"
    echo "3. Run notification tests"
    echo "4. Test bid creation and acceptance"
    echo "5. Verify notification delivery and actions"
    echo ""
    echo "📊 Monitor the deployment:"
    echo "eas build:list --platform ios"
    echo ""
else
    echo ""
    echo "❌ BUILD FAILED!"
    echo "=============="
    echo ""
    echo "Please check the error messages above and try again."
    echo ""
    echo "Common issues:"
    echo "• Missing iOS certificates or provisioning profiles"
    echo "• Invalid Firebase configuration"
    echo "• Code compilation errors"
    echo "• Network connectivity issues"
    echo ""
    echo "For detailed logs: eas build:list --platform ios"
    exit 1
fi