# 🤖 Google Play Console Setup & App Submission

## 📊 Build Information
- **App**: ESKICI (İmece)
- **Version**: 1.3.0
- **Version Code**: 10 (auto-incremented)
- **Build ID**: 201b981d-8634-4723-ab8e-7abf40aa3b45
- **Package**: com.sbabadag.imece
- **Format**: AAB (Android App Bundle)

## 🏗️ Build Status
- **Status**: 🔄 Building on EAS servers (Fixed Gradle issues)
- **Build URL**: https://expo.dev/accounts/sbabadag/projects/barter-mvp-expo/builds/201b981d-8634-4723-ab8e-7abf40aa3b45
- **Previous Build**: dd6d4fd2-8b9e-4e27-9642-20045c4fa09e (Failed - Gradle error)
- **Fix Applied**: Removed custom android/ directory, using EAS managed Android config
- **Expected Time**: 10-20 minutes

## 📱 Google Play Console Setup

### 1. Create Google Play Console Account
1. Go to: https://play.google.com/console/
2. Sign in with Google account
3. Pay $25 one-time registration fee (if new developer)
4. Complete developer profile
5. Accept Google Play Developer Distribution Agreement

### 2. Create New App
1. Click "Create app"
2. **App name**: ESKICI - Komşular Arası Al-Sat
3. **Default language**: Turkish (TR)
4. **App or game**: App
5. **Free or paid**: Free
6. Check declarations and create app

### 3. Complete App Information

#### App Details
- **Category**: Shopping
- **Tags**: shopping, marketplace, trading, neighbors
- **Contact email**: sbabadag@gmail.com
- **External marketing**: No (if not applicable)

#### Store Listing
- **App name**: ESKICI - Komşular Arası Al-Sat
- **Short description**: Komşular arasında güvenli takas ve alım-satım platformu. Yakınınızdaki kişilerle kolayca ürün alışverişi yapın.
- **Full description**: 
```
ESKICI, komşular arasında güvenli ve kolay alım-satım yapmanızı sağlayan bir platformdur.

ÖZELLİKLER:
• Yakınınızdaki kişilerle güvenli alışveriş
• Gerçek zamanlı teklif sistemi
• Konum bazlı ilan görüntüleme
• Anında bildirimler
• Güvenli mesajlaşma sistemi
• Fotoğraf yükleme ve paylaşma

NEDEN ESKICI?
• Komşularınızla güvenilir alışveriş
• Hızlı ve kolay kullanım
• Gerçek zamanlı bildirimler
• Ücretsiz kullanım
• Türkçe dil desteği

Hemen indirin ve komşularınızla alışverişe başlayın!
```

#### Assets Needed
- **App icon**: 512x512px (already configured)
- **Feature graphic**: 1024x500px promotional image
- **Screenshots**: 
  - Phone: At least 2 screenshots (320-3840px width)
  - 7-inch tablet: Recommended
  - 10-inch tablet: Recommended

## 🔒 Content Rating

### Complete Content Rating Questionnaire
1. Go to Content rating section
2. Select category: **Reference, News or Educational**
3. Answer questionnaire (all "No" for violence, etc.)
4. Target age: **Everyone**
5. Submit for rating

## 🌍 Target Countries

### Recommended Initial Release
- **Turkey**: Primary market
- **United States**: Large market
- **Germany**: European market
- **United Kingdom**: English-speaking market

## 🧪 Testing Track Strategy

### 1. Internal Testing (Start Here)
- Upload AAB to Internal Testing
- Add up to 100 internal testers
- Test core functionality
- Verify push notifications
- Test on various devices

### 2. Closed Testing (Beta)
- Create closed testing track
- Add beta testers (friends, family)
- Gather feedback
- Performance testing

### 3. Open Testing (Optional)
- Public beta testing
- Wider feedback collection
- Final testing before production

### 4. Production Release
- Staged rollout: 5% → 20% → 50% → 100%
- Monitor crash reports
- Respond to user feedback

## 📋 Required Policies

### 1. Privacy Policy
Already included in app - verify URL is accessible

### 2. Target API Level
✅ Targeting Android 14 (API 34) - compliant

### 3. App Signing
✅ Use Google Play App Signing (recommended)

## 🔔 Push Notifications Setup

### Firebase Setup (If needed)
1. Go to Firebase Console: https://console.firebase.google.com/
2. Add Android app to existing project
3. Package name: `com.sbabadag.imece`
4. Download `google-services.json`
5. Verify FCM is enabled

### Push Notification Testing
- Test on development build (not Expo Go)
- Verify notifications appear in Android notification tray
- Test with app in background and closed

## 📤 Submission Checklist

### Before Upload:
- [ ] Build completed successfully
- [ ] Google Play Console account created
- [ ] App created in Console
- [ ] Store listing completed
- [ ] Screenshots and graphics prepared
- [ ] Content rating completed
- [ ] Target countries selected
- [ ] Privacy policy accessible

### Upload Process:
1. Download AAB from EAS build
2. Go to Google Play Console → Your App → Release → Internal Testing
3. Create new release
4. Upload AAB file
5. Add release notes
6. Review and rollout to internal testing

### After Upload:
- [ ] Test installation from Play Console
- [ ] Verify app functionality
- [ ] Test push notifications
- [ ] Gather internal feedback
- [ ] Fix any issues
- [ ] Promote to closed testing when ready

## 🚀 Release Notes Template

### Version 1.3.0
```
🔔 Yeni Özellikler:
• Anında bildirim sistemi eklendi
• Teklif alındığında otomatik bildirim
• Uygulama kapalıyken bile bildirim desteği
• Gerçek zamanlı teklif güncellemeleri

🛠️ Iyileştirmeler:
• Performans optimizasyonları
• Hata düzeltmeleri
• Kullanıcı deneyimi iyileştirmeleri

Güncellemeyi indirin ve yeni özellikleri keşfedin!
```

## 🔗 Important Links
- **Google Play Console**: https://play.google.com/console/
- **Firebase Console**: https://console.firebase.google.com/
- **Android Developer Guide**: https://developer.android.com/distribute/play-console
- **EAS Build Dashboard**: https://expo.dev/accounts/sbabadag/projects/barter-mvp-expo