# Force Icon Update in Expo Go

## Problem: Expo Go Caches Icons Aggressively
Expo Go caches app icons, splash screens, and other assets very aggressively to improve performance. This means new icons don't show immediately.

## Solutions (Try in Order):

### Method 1: Clear Expo Go Cache ⭐ RECOMMENDED
1. **Close Expo Go completely** (force close the app)
2. **Delete the app** from "Recently opened" in Expo Go
3. **Clear Expo Go app cache**:
   - iOS: Settings → General → iPhone Storage → Expo Go → Offload App
   - Android: Settings → Apps → Expo Go → Storage → Clear Cache
4. **Reinstall Expo Go** (if needed)
5. **Scan the NEW QR code** from port 8086

### Method 2: Change App Configuration
Update version number or app slug to force cache invalidation:
- In app.json, change "version" from "1.3.0" to "1.3.1"
- Or change "slug" temporarily

### Method 3: Use Development Build
- Development builds don't have the same caching issues
- More reliable for testing icon changes

### Method 4: Test on Web Browser
- Open http://localhost:8086 in browser
- Icons update immediately on web
- Verify your new icons are working

## Current Status:
✅ Cache cleared with --reset-cache
✅ Running on fresh port 8086
✅ New QR code generated

## Next Steps:
1. Force close Expo Go
2. Clear Expo Go cache (see Method 1)
3. Scan the NEW QR code from port 8086
4. Your beautiful new icons should appear!

## If Icons Still Don't Update:
- Check that you copied the images to the correct assets folder
- Verify file names exactly match: icon.png, adaptive-icon.png, splash.png, favicon.png
- Try the version number change method