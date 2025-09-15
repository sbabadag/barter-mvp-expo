# 🚀 TestFlight Submission Guide - ESKICI App

## ✅ Prerequisites Completed
- ✅ Apple Developer Account: `sbabadag@gmail.com`
- ✅ App Store Connect App ID: `6752503885`
- ✅ Team ID: `5PH75H5VQN`
- ✅ Bundle ID: `com.sbabadag.imece`
- ✅ App configured for store distribution

## 📦 Step 1: Build for Production

Run this command to build your iOS app for TestFlight:

```bash
eas build --platform ios --profile production
```

This will:
- ✅ Build in Release mode
- ✅ Auto-increment build number (currently at 2)
- ✅ Create store-ready binary
- ✅ Upload to EAS servers

## 📤 Step 2: Submit to App Store Connect

After build completes, submit to TestFlight:

```bash
eas submit --platform ios --profile production
```

This will automatically:
- ✅ Upload your app to App Store Connect
- ✅ Use your configured Apple ID credentials
- ✅ Submit to the correct app (ID: 6752503885)

## 🧪 Step 3: Configure TestFlight

1. **Go to App Store Connect**: https://appstoreconnect.apple.com
2. **Select your app**: "ESKICI"
3. **Go to TestFlight tab**
4. **Wait for processing** (usually 10-30 minutes)
5. **Add test information**:
   - **What to Test**: "Komşular arası ikinci el ürün alışverişi ve takas uygulaması. Favoriler sistemi, teklif verme, mesajlaşma ve bildirim özelliklerini test edin."
   - **App Description**: "ESKICI, yakın çevrenizdeki komşularınızla güvenli ikinci el ürün alışverişi yapabileceğiniz bir platformdur."

## 👥 Step 4: Add Testers

### Internal Testing (Team Members)
1. **Users and Access** → **App Store Connect Users**
2. **Add users** with their Apple ID emails
3. **TestFlight Internal Testing** → **Add testers**

### External Testing (Beta Users)
1. **Create test group**: "Beta Testers"
2. **Add external testers** (up to 10,000 users)
3. **Send invitations** via email or public link

## 📱 Step 5: Test the App

Testers will:
1. **Download TestFlight** from App Store
2. **Accept invitation** via email or link
3. **Install ESKICI** from TestFlight
4. **Test all features**:
   - User registration/login
   - Creating listings with photos
   - Browsing and searching items
   - Making offers/bids
   - Messaging system
   - Favorites/likes system
   - Push notifications

## 🐛 Step 6: Collect Feedback

Monitor:
- **Crash reports** in TestFlight
- **Feedback** from testers
- **Usage analytics**
- **Performance metrics**

## 🔄 Step 7: Iterate

For updates:
1. **Fix issues** based on feedback
2. **Increment version** in app.json
3. **Build again**: `eas build --platform ios --profile production`
4. **Submit update**: `eas submit --platform ios --profile production`

## ⚠️ Important Notes

### App Store Review Guidelines
- ✅ **Content**: Family-friendly marketplace
- ✅ **Privacy**: Location/camera permissions properly described
- ✅ **Functionality**: All features working properly
- ✅ **Design**: iOS Human Interface Guidelines compliant

### TestFlight Limitations
- **90-day expiry** for beta builds
- **Max 10,000 external testers**
- **Max 100 apps** per developer account
- **App Store Review** required for external testing

## 📞 Support Information

- **Developer**: sbabadag@gmail.com
- **App Name**: ESKICI
- **Bundle ID**: com.sbabadag.imece
- **Category**: Shopping
- **Platform**: iOS 13.0+

## 🎯 Success Criteria

Your app is ready for TestFlight when:
- ✅ **Build completes** successfully
- ✅ **Upload succeeds** to App Store Connect
- ✅ **Processing completes** (no errors)
- ✅ **Testers can install** and use the app
- ✅ **Core features work** as expected

---

## 🚦 Next Steps

1. **Run the build command** (see Step 1)
2. **Wait for build completion** (~10-15 minutes)
3. **Submit to App Store Connect** (see Step 2)
4. **Configure TestFlight** settings
5. **Add testers** and start testing!

Your app is configured and ready for TestFlight! 🎉