# Apple App Store Submission Checklist

## ⚠️ Critical Configuration Needed

### 1. Google Maps API Key
**Current Status**: Placeholder key detected  
**Action Required**: Replace the placeholder API key in `app.json` with your actual Google Maps API key.

```json
"android": {
  "config": {
    "googleMaps": {
      "apiKey": "YOUR_ACTUAL_GOOGLE_MAPS_API_KEY_HERE"
    }
  }
}
```

**How to get a Google Maps API Key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "Maps SDK for Android" and "Maps SDK for iOS"
4. Create credentials → API Key
5. Restrict the API key to your bundle identifier

### 2. Bundle Identifier Verification
- **Current**: `com.sbabadag.imece`
- **Status**: ✅ Properly formatted
- **Action**: Ensure this matches your Apple Developer account app identifier

### 3. Version Information
- **App Version**: 1.0.0 ✅
- **Build Number**: 1 ✅
- **Status**: Ready for submission

### 4. Required Assets Checklist
- [ ] App Icon (1024x1024) - `./assets/icon.png`
- [ ] Splash Screen - `./assets/splash.png`
- [ ] Screenshots for App Store listing

### 5. Privacy Permissions
✅ All required permissions are properly configured:
- Location access for listing locations
- Camera access for photos
- Photo library access
- Microphone access for voice messages

### 6. App Store Categories
✅ Added primary category: Shopping

## Next Steps After Environment Setup

1. **Update Google Maps API Key** (Critical)
2. **Verify all assets are properly sized**
3. **Test the app thoroughly**
4. **Create production build with EAS**
5. **Submit to App Store Connect**

## Build Commands (After environment setup)

```bash
# Login to Expo
eas login

# Create production build
eas build --platform ios --profile production

# Submit to App Store (after build completes)
eas submit --platform ios --profile production
```

## App Store Connect Preparation

You'll need to:
1. Create app listing in App Store Connect
2. Add app description in Turkish and English
3. Upload screenshots (various iPhone sizes)
4. Set pricing and availability
5. Complete App Review Information
6. Add age rating information

## Important Notes

- Your app appears to be a marketplace/trading platform (ESKICI/İmece)
- Ensure compliance with App Store guidelines for marketplace apps
- Consider adding content moderation features if users can post listings
- Verify all Turkish language content is properly encoded