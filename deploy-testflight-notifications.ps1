# TestFlight Deployment Script for ESKICI iOS App - Windows PowerShell Version
# Version: 1.2.0 - Notification System Update

Write-Host "🚀 Starting TestFlight deployment for ESKICI iOS App" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Check if EAS CLI is installed
try {
    eas whoami 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "🔐 Please log in to EAS..." -ForegroundColor Yellow
        eas login
    }
} catch {
    Write-Host "❌ EAS CLI not found. Installing..." -ForegroundColor Red
    npm install -g @expo/eas-cli
    eas login
}

# Clear any previous builds
Write-Host "🧹 Cleaning up previous builds..." -ForegroundColor Yellow
if (Test-Path ".expo") {
    Remove-Item ".expo" -Recurse -Force
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Pre-build checks
Write-Host "🔍 Running pre-build checks..." -ForegroundColor Yellow

# Check if Firebase config exists
if (-not (Test-Path "GoogleService-Info.plist")) {
    Write-Host "❌ Error: GoogleService-Info.plist not found!" -ForegroundColor Red
    Write-Host "Please add your Firebase iOS configuration file." -ForegroundColor Red
    exit 1
}

# Check if all required notification files exist
$RequiredFiles = @(
    "src/services/notifications.ts",
    "src/services/advancedNotifications.ts",
    "app/notification-settings.tsx",
    "app/notifications.tsx",
    "sql/setup_notification_system.sql"
)

foreach ($file in $RequiredFiles) {
    if (-not (Test-Path $file)) {
        Write-Host "❌ Error: Required file $file not found!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ All notification system files are present" -ForegroundColor Green

# Validate app.json configuration
Write-Host "🔍 Validating app configuration..." -ForegroundColor Yellow

# Read and validate app.json
try {
    $appJson = Get-Content "app.json" | ConvertFrom-Json
    $expo = $appJson.expo
    
    Write-Host "📱 App Version: $($expo.version)" -ForegroundColor Cyan
    
    # Check iOS config
    if (-not $expo.ios.bundleIdentifier) {
        Write-Host "❌ iOS bundle identifier missing" -ForegroundColor Red
        exit 1
    }
    
    # Check notification permissions
    if (-not $expo.ios.infoPlist.NSUserNotificationsUsageDescription) {
        Write-Host "❌ Notification permission description missing" -ForegroundColor Red
        exit 1
    }
    
    # Check Firebase plugin
    $firebasePlugin = $expo.plugins | Where-Object { 
        $_ -is [array] -and $_[0] -eq "@react-native-firebase/app" 
    }
    if (-not $firebasePlugin) {
        Write-Host "❌ Firebase plugin not configured" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ App configuration is valid" -ForegroundColor Green
    
} catch {
    Write-Host "❌ App configuration validation failed: $_" -ForegroundColor Red
    exit 1
}

# Build for TestFlight (production profile)
Write-Host "🏗️  Building iOS app for TestFlight..." -ForegroundColor Green
Write-Host "This may take 10-15 minutes..." -ForegroundColor Yellow

# Start the build
eas build --platform ios --profile production --auto-submit

# Check build status
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host "==================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 Your iOS app has been built and submitted to TestFlight!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Yellow
    Write-Host "1. Check your email for App Store Connect notifications"
    Write-Host "2. Log into App Store Connect (https://appstoreconnect.apple.com/)"
    Write-Host "3. Go to TestFlight section"
    Write-Host "4. Add internal testers"
    Write-Host "5. Distribute the build for testing"
    Write-Host ""
    Write-Host "🔔 Notification System Features Included:" -ForegroundColor Magenta
    Write-Host "• Server-side automatic notifications"
    Write-Host "• Direct bid accept/reject from notifications"
    Write-Host "• Rich notification categories"
    Write-Host "• User notification preferences"
    Write-Host "• Firebase FCM integration"
    Write-Host "• Comprehensive badge system"
    Write-Host ""
    Write-Host "🧪 Testing Instructions:" -ForegroundColor Cyan
    Write-Host "1. Install from TestFlight"
    Write-Host "2. Navigate to /test-notifications in app"
    Write-Host "3. Run notification tests"
    Write-Host "4. Test bid creation and acceptance"
    Write-Host "5. Verify notification delivery and actions"
    Write-Host ""
    Write-Host "📊 Monitor the deployment:" -ForegroundColor Yellow
    Write-Host "eas build:list --platform ios"
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ BUILD FAILED!" -ForegroundColor Red
    Write-Host "==============" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check the error messages above and try again." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "• Missing iOS certificates or provisioning profiles"
    Write-Host "• Invalid Firebase configuration"
    Write-Host "• Code compilation errors"
    Write-Host "• Network connectivity issues"
    Write-Host ""
    Write-Host "For detailed logs: eas build:list --platform ios" -ForegroundColor Cyan
    exit 1
}