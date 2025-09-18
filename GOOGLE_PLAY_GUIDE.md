# 🤖 Google Play Store Submission Guide - ESKICI App

## 📋 Prerequisites

### ✅ Already Configured:
- ✅ Package name: `com.sbabadag.imece`
- ✅ Version: 1.3.0
- ✅ Version code: 3 (updated for Play Store)
- ✅ Push notifications configured
- ✅ EAS build profile updated for AAB (Android App Bundle)

### 🔧 Required Setup:

#### 1. Google Play Console Account
- Create/access Google Play Console account at: https://play.google.com/console
- Pay $25 one-time registration fee (if new developer)
- Complete developer profile and verify identity

#### 2. Google Service Account (for EAS Submit)
You'll need to create a service account JSON file for automated submissions:

**Steps:**
1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Create new project or select existing one
3. Enable Google Play Developer API
4. Create Service Account with Play Developer permissions
5. Download JSON key file as `google-play-service-account.json`
6. Add service account email to Google Play Console users

## 🚀 Build Commands

### Build Android AAB (Android App Bundle)
```bash
eas build --platform android --profile production
```

This will create:
- ✅ AAB format (required for Play Store)
- ✅ Production signed build
- ✅ Auto-incremented version code
- ✅ Optimized bundle size
- ✅ Push notification support

### Submit to Google Play (after build completes)
```bash
eas submit --platform android --profile production
```

## 📱 Android Features in v1.3.0

### 🔔 Push Notifications
- ✅ FCM (Firebase Cloud Messaging) ready
- ✅ Notification channels configured
- ✅ Background notification support
- ✅ Auto token registration
- ⚠️ **Note**: Full push notifications require development build (not Expo Go)

### 🎯 App Features
- ✅ Real-time bidding system
- ✅ Location-based listings
- ✅ Image upload and optimization
- ✅ User authentication
- ✅ Push notifications for bids
- ✅ In-app messaging

## 📊 Google Play Store Requirements

### ✅ Already Included:
- ✅ Target SDK 34 (Android 14)
- ✅ App Bundle format
- ✅64-bit architecture support
- ✅ Permissions properly declared
- ✅ Privacy policy (included in app)
- ✅ Proper app signing

### 📝 Store Listing Requirements:
- **App Title**: ESKICI - Komşular Arası Al-Sat
- **Short Description**: Komşular arasında güvenli takas ve alım-satım platformu
- **Category**: Shopping
- **Content Rating**: Everyone
- **Screenshots**: Need 2+ phone screenshots
- **Feature Graphic**: 1024x500px promotional image
- **App Icon**: Already configured (512x512px)

## 🔒 Security & Privacy

### ✅ Configured:
- ✅ App signing by Google Play
- ✅ Target API level compliance
- ✅ Permissions requested appropriately
- ✅ Privacy policy included
- ✅ Data encryption in transit (HTTPS)

## 🧪 Testing Track Strategy

### 1. Internal Testing (Recommended First)
- Upload AAB to Internal Testing track
- Test with small group (up to 100 testers)
- Verify push notifications work
- Test core functionality

### 2. Closed Testing (Beta)
- Expand to larger beta group
- Gather feedback
- Test on various devices
- Performance optimization

### 3. Open Testing (Optional)
- Public beta testing
- Gather wider feedback
- Stress test servers

### 4. Production Release
- Full public release
- Staged rollout (recommend 5% → 20% → 50% → 100%)

## ⚠️ Important Notes

### Push Notifications
- **Android**: Requires Firebase project setup for full functionality
- **Google Services**: `google-services.json` file already configured
- **Testing**: Use development build for full push notification testing

### App Permissions
Current permissions:
- 📍 Location (for listing location features)
- 📷 Camera (for taking photos)
- 📱 Storage (for image uploads)
- 🎤 Microphone (for voice messages)
- 📳 Vibration (for notifications)

## 🚀 Next Steps

1. **Create Google Play Console account** (if needed)
2. **Set up service account** for EAS submissions
3. **Build Android AAB** with EAS
4. **Create app listing** in Play Console
5. **Upload to Internal Testing**
6. **Test push notifications** thoroughly
7. **Graduate to production** when ready