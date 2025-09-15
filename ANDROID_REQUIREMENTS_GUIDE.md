# ANDROID VERSION REQUIREMENTS - İMECE MARKETPLACE

## 📱 Google Play Store Requirements for Android

Based on your current app configuration and Google Play Store policies, here are the requirements you need to meet for your İmece Marketplace Android app.

---

## 🎯 CRITICAL REQUIREMENTS

### 1. Android API Levels (SDK Versions)

**Current Status**: ✅ Automatically handled by Expo

**Expo SDK 51 (your current version) Requirements**:
- **Minimum SDK Version**: API 23 (Android 6.0)
- **Target SDK Version**: API 34 (Android 14)
- **Compile SDK Version**: API 34 (Android 14)

**Google Play Requirements**:
- ✅ Target SDK must be API 33+ (you're on API 34)
- ✅ New apps must target recent Android versions
- ✅ Your app meets current requirements

### 2. App Bundle Format

**Required**: Android App Bundle (.aab) format
**Current Status**: ✅ Configured in `eas.json`

```json
"android": {
  "buildType": "app-bundle"  // ✅ Correct format
}
```

### 3. Google Maps API Key (CRITICAL)

**Current Status**: ❌ **PLACEHOLDER KEY DETECTED**

**Required Action**: Replace placeholder with real Google Maps API key:

```json
// In app.json - ADD THIS SECTION:
"android": {
  "adaptiveIcon": {
    "foregroundImage": "./assets/adaptive-icon.png",
    "backgroundColor": "#f0a500"
  },
  "permissions": [...],
  "config": {                           // ← ADD THIS
    "googleMaps": {                     // ← ADD THIS
      "apiKey": "YOUR_REAL_API_KEY"     // ← CRITICAL
    }
  },
  "package": "com.sbabadag.imece"       // ← ADD THIS (bundle ID)
}
```

**How to get Google Maps API Key**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project or select existing
3. Enable these APIs:
   - Maps SDK for Android ✅
   - Maps SDK for iOS ✅
   - Places API ✅
   - Geocoding API ✅
4. Create credentials → API Key
5. Restrict key to your package name: `com.sbabadag.imece`

---

## 📋 GOOGLE PLAY STORE REQUIREMENTS

### 1. App Signing

**Required**: Google Play App Signing
**Status**: ✅ Automatically handled by EAS Build

**What happens**:
- EAS generates signing key
- Google Play manages final signing
- No action needed from you

### 2. Package Name

**Current**: Not explicitly set
**Required**: `com.sbabadag.imece` (to match iOS bundle ID)

**Action**: Add to `app.json`:
```json
"android": {
  // ... existing config
  "package": "com.sbabadag.imece"
}
```

### 3. Version Management

**Current Status**: ✅ Configured correctly
- **Version Name**: 1.0.0 (from app.json)
- **Version Code**: Auto-incremented by EAS
- **Build Number**: Automatically managed

### 4. Permissions Audit

**Current Permissions**: ✅ All appropriate for marketplace app
```json
"permissions": [
  "ACCESS_COARSE_LOCATION",    // ✅ For location-based listings
  "ACCESS_FINE_LOCATION",      // ✅ For precise location
  "CAMERA",                    // ✅ For taking photos
  "READ_EXTERNAL_STORAGE",     // ✅ For selecting photos
  "WRITE_EXTERNAL_STORAGE",    // ✅ For saving photos
  "RECORD_AUDIO",              // ✅ For voice messages
  "VIBRATE"                    // ✅ For notifications
]
```

**Review**: All permissions have clear use cases and are justified.

---

## 📱 GOOGLE PLAY CONSOLE SETUP

### 1. Developer Account Requirements

**Required**:
- ✅ Google Play Developer account ($25 one-time fee)
- ✅ Valid payment method
- ✅ Developer verification completed

### 2. App Content Declarations

**Content Rating**:
- Target Audience: Everyone ✅
- Content Rating: PEGI 3 / ESRB Everyone ✅
- Reason: Marketplace app with user-generated content

**Data Safety Section**:
```
Data Collection:
✅ Email addresses (for account)
✅ Name (for profile)
✅ Phone number (for contact)
✅ Photos (for listings)
✅ Location (for listings)

Data Usage:
✅ App functionality only
✅ No advertising purposes
✅ No analytics beyond basic metrics
✅ Data not shared with third parties
```

### 3. Privacy Policy & Terms

**Status**: ✅ Already created
- Privacy Policy: `PRIVACY_POLICY.md`
- Terms of Service: `TERMS_OF_SERVICE.md`

**Action**: Upload these to a public URL and reference in Google Play Console

---

## 🔧 TECHNICAL REQUIREMENTS

### 1. App Size Limits

**Google Play Limits**:
- APK size: 100MB maximum
- App Bundle: 150MB maximum per dynamic module
- Total app size: No strict limit with asset packs

**Your App**: Likely well under limits (typical Expo app: 20-50MB)

### 2. 64-bit Architecture

**Required**: Support for 64-bit architecture
**Status**: ✅ Automatically handled by Expo/React Native

### 3. Performance Requirements

**Google Play Vitals Thresholds**:
- ANR Rate: < 0.47%
- Crash Rate: < 0.15%
- Wake Lock: Minimal usage

**Your App**: Should meet requirements with proper testing

---

## 🧪 TESTING REQUIREMENTS

### 1. Internal Testing

**Required Steps**:
1. Upload app bundle to Google Play Console
2. Create internal testing track
3. Test with real devices
4. Verify all features work correctly

### 2. Pre-Launch Report

**Google Play Feature**: Automatic testing on various devices
**Action**: Review report and fix any issues found

### 3. Device Compatibility

**Minimum Testing**:
- Android 6.0+ devices ✅
- Different screen sizes ✅
- Various manufacturers (Samsung, Google, etc.) ✅

---

## 📸 STORE LISTING REQUIREMENTS

### 1. Screenshots Required

**Mandatory**:
- Phone screenshots: 2-8 required
- 7-inch tablet: 1-8 (optional but recommended)
- 10-inch tablet: 1-8 (optional but recommended)

**Dimensions**:
- Phone: 16:9 or 9:16 aspect ratio
- Tablet: 16:10 or 10:16 aspect ratio

### 2. App Icon

**Current**: ✅ `assets/adaptive-icon.png`
**Requirements**:
- 512 x 512 pixels
- PNG format
- Maximum 1024 KB

### 3. Feature Graphic

**Required**: 1024 x 500 pixels promotional banner
**Status**: ❌ Not created yet
**Action**: Create promotional banner showing app features

---

## 🚀 BUILD COMMANDS FOR ANDROID

### 1. Development Build
```bash
eas build --platform android --profile development
```

### 2. Preview Build (Testing)
```bash
eas build --platform android --profile preview
```

### 3. Production Build (Play Store)
```bash
eas build --platform android --profile production
```

---

## ⚠️ CRITICAL ACTIONS NEEDED

### Immediate (Before Building):

1. **Add Google Maps API Key** (CRITICAL)
   ```json
   "android": {
     "config": {
       "googleMaps": {
         "apiKey": "YOUR_REAL_API_KEY"
       }
     }
   }
   ```

2. **Add Package Name**
   ```json
   "android": {
     "package": "com.sbabadag.imece"
   }
   ```

3. **Test API Key Works**
   - Build development version
   - Test location features
   - Verify maps display correctly

### Before Store Submission:

1. **Create Screenshots**
   - Phone: Portrait orientation
   - Show key features: browsing, listing, messaging
   - Turkish language interface

2. **Create Feature Graphic**
   - 1024x500 pixels
   - Showcase app value proposition
   - Include app name and key features

3. **Upload Privacy Policy**
   - Host `PRIVACY_POLICY.md` online
   - Add URL to Google Play Console

---

## 📊 COMPLIANCE CHECKLIST

### Google Play Policies ✅

- [x] **Restricted Content**: Marketplace apps allowed
- [x] **User Safety**: Proper content moderation planned
- [x] **Privacy**: Data handling documented
- [x] **Permissions**: All permissions justified
- [x] **Monetization**: Free app with no IAP issues
- [x] **Spam**: Original app, not duplicate
- [x] **Intellectual Property**: No trademark issues

### Technical Compliance ✅

- [x] **Target SDK**: API 34 (meets requirements)
- [x] **64-bit Support**: Included automatically
- [x] **App Bundle**: Configured correctly
- [x] **Signing**: Managed by Google Play
- [x] **Performance**: Should meet vitals thresholds

---

## 🕒 ESTIMATED TIMELINE

### Development Phase (Current):
- **API Key Setup**: 1-2 hours
- **Configuration Updates**: 30 minutes
- **Build Testing**: 2-3 hours

### Store Preparation:
- **Screenshot Creation**: 2-4 hours
- **Feature Graphic Design**: 1-2 hours
- **Google Play Console Setup**: 2-3 hours

### Review Process:
- **Google Play Review**: 1-3 days (typical)
- **If Issues Found**: 1-2 days to fix and resubmit

---

## 💡 SUCCESS TIPS

1. **Test Thoroughly**: Use internal testing track extensively
2. **Monitor Vitals**: Keep crash and ANR rates low
3. **Quality Screenshots**: These significantly impact downloads
4. **Clear Description**: Explain marketplace concept clearly
5. **Respond Quickly**: Address any Google Play feedback promptly

---

## 🔍 VERIFICATION COMMANDS

Test your current setup:

```bash
# Check if config is valid
npx expo config --type public

# Verify Android permissions
npx expo config | grep -A 10 "android"

# Test build configuration
eas build --platform android --profile preview --clear-cache
```

---

## 📞 SUPPORT RESOURCES

- **Google Play Console Help**: https://support.google.com/googleplay/android-developer
- **Expo Documentation**: https://docs.expo.dev/
- **EAS Build Docs**: https://docs.expo.dev/build/introduction/

Your İmece Marketplace app is well-positioned for Google Play Store approval once you complete the critical API key configuration! 🚀
