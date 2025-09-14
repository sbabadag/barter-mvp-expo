# Production Build Guide for App Store Submission

## Prerequisites ✅
- [x] Node.js installed
- [x] EAS CLI installed (`npm install -g @expo/eas-cli`)
- [x] Expo account configured
- [x] Apple Developer Account active
- [x] App configuration complete

## Critical: Update Google Maps API Key

**Before building**, you MUST replace the placeholder Google Maps API key in `app.json`:

```json
"android": {
  "config": {
    "googleMaps": {
      "apiKey": "YOUR_ACTUAL_GOOGLE_MAPS_API_KEY_HERE"
    }
  }
}
```

## Step-by-Step Build Process

### 1. Login to Expo Account
```bash
eas login
```
Enter your credentials when prompted.

### 2. Configure Apple Developer Credentials
```bash
eas credentials
```
Select iOS → Production → Set up new credentials

**You'll need:**
- Apple Developer Account credentials
- Team ID: `5PH75H5VQN` (already configured)
- Bundle Identifier: `com.sbabadag.imece` (already configured)

### 3. Start Production Build
```bash
eas build --platform ios --profile production
```

**This will:**
- Create a production-ready iOS binary
- Auto-increment build number
- Use Release configuration
- Optimize for App Store submission

### 4. Monitor Build Progress
- Build typically takes 10-20 minutes
- You'll receive email notification when complete
- Check status: `eas build:list`

### 5. Download Built Binary
After build completes:
- Download .ipa file from build dashboard
- Or use: `eas build:download [BUILD_ID]`

## Build Profiles Available

### Production (App Store)
```bash
eas build --platform ios --profile production
```
- For App Store submission
- Fully optimized
- Release configuration

### Preview (TestFlight/Internal)
```bash
eas build --platform ios --profile preview
```
- For internal testing
- TestFlight distribution
- Testing before App Store submission

### Development
```bash
eas build --platform ios --profile development
```
- For development testing
- Includes development tools

## Troubleshooting Common Issues

### 1. Credentials Issues
**Problem**: Apple Developer credentials not working
**Solution**: 
- Verify Apple Developer account is active
- Check team membership permissions
- Use `eas credentials` to reconfigure

### 2. Build Failures
**Problem**: Build fails with dependency issues
**Solution**:
- Check `package.json` for conflicting dependencies
- Clear cache: `eas build --platform ios --profile production --clear-cache`

### 3. Bundle Identifier Issues
**Problem**: Bundle ID already exists or conflicts
**Solution**:
- Verify bundle ID matches Apple Developer portal
- Ensure bundle ID is unique to your account

### 4. Icon/Asset Issues
**Problem**: Icon validation fails
**Solution**:
- Ensure icon is exactly 1024x1024 pixels
- Check for transparency (not allowed)
- Validate PNG format

## Post-Build Verification

### 1. Download and Test
- Download the .ipa file
- Install on test device via Xcode
- Test core functionality

### 2. File Size Check
- Ensure app size is reasonable
- iOS apps should typically be under 4GB
- Your app appears to be a standard size

### 3. Metadata Validation
- Verify version numbers match
- Check bundle identifier
- Confirm build number incremented

## Next Steps After Successful Build

1. **Test the Binary**
   - Install on physical iOS device
   - Test all major features
   - Verify no crashes or major issues

2. **Prepare App Store Connect**
   - Upload binary to App Store Connect
   - Fill in app metadata
   - Add screenshots

3. **Submit for Review**
   - Complete App Store listing
   - Submit for Apple's review process

## Build Commands Quick Reference

```bash
# Login to Expo
eas login

# Build for App Store
eas build --platform ios --profile production

# Check build status
eas build:list

# Download specific build
eas build:download [BUILD_ID]

# Submit to App Store (after build)
eas submit --platform ios --profile production
```

## Expected Timeline

- **Build Time**: 10-20 minutes
- **Download**: 1-5 minutes depending on connection
- **App Store Upload**: 5-15 minutes
- **Apple Review**: 24-48 hours (typical)

## Important Notes

1. **Google Maps API Key**: Must be updated before building
2. **Apple Developer Account**: Must be active and paid
3. **Bundle Identifier**: Must match your Apple Developer portal
4. **Version Number**: Should be 1.0.0 for first submission
5. **Build Number**: Will auto-increment with each build

Your app is configured and ready for production build once you:
1. Update the Google Maps API key
2. Install Node.js and EAS CLI
3. Run the build commands above

Good luck with your App Store submission! 🚀