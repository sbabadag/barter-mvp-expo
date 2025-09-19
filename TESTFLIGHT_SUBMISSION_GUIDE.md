# 🚀 ESKICI - TestFlight Submission Guide

## 📱 Build Information
✅ **iOS Production Build Ready!**
- **Build ID:** d4ae4539-f535-4dc7-8a84-a858e5e4f3b3
- **Version:** 1.3.1 (Build Number: 33)
- **Status:** ✅ Finished (Production Ready)
- **IPA Download:** https://expo.dev/artifacts/eas/sgeNMSEZiLwdLrZ6ETqyn2.ipa
- **SDK Version:** Expo 54.0.0
- **Build Date:** September 19, 2025

## 🎯 TestFlight Submission Steps

### 1. App Store Connect Setup
🌐 **URL:** https://appstoreconnect.apple.com

#### Create New App:
1. Sign in with your Apple Developer account
2. Click **"My Apps"** → **"+"** → **"New App"**
3. Fill out app information:

```
Platform: iOS
Name: ESKICI
Primary Language: Turkish
Bundle ID: com.sbabadag.bartermvpexpo (or your bundle ID)
SKU: ESKICI-2025 (unique identifier)
User Access: Full Access
```

#### App Information:
```
Category: Primary - Lifestyle, Secondary - Social Networking
Content Rights: No, it does not contain, show, or access third-party content
Age Rating: 4+ (Everyone)
```

### 2. Version Information
```
Version: 1.3.1
Copyright: 2025 ESKICI
Promotional Text: Komşularınızla güvenli takas platformu! 🤝
Description: [See full description below]
Keywords: takas,komşu,alsat,ikinciel,marketplace,sürdürülebilir
Support URL: https://github.com/sbabadag/barter-mvp-expo
Marketing URL: (optional)
```

### 3. App Store Description

#### Short Description (170 characters):
```
Komşularınızla güvenli takas! Kullanmadığınız eşyaları değerlendirin, ihtiyacınız olanları bulun. Çevre dostu yaşam tarzı! 🤝♻️
```

#### Full Description:
```
🏠 ESKICI - Komşular Arası Güvenli Takas Platformu

Artık kullanmadığınız eşyaları çöpe atmak yerine, komşularınızla takas edebilirsiniz! ESKICI ile çevrenizde yaşayan insanlarla güvenli bir şekilde ürün alışverişi yapın.

✨ ANA ÖZELLİKLER:
🤝 Güvenli komşuluk ağı
📍 Yakın mesafe odaklı eşleşme
💬 Anlık mesajlaşma sistemi
⭐ Güvenilir puanlama sistemi
📱 Kolay kullanımlı arayüz
♻️ Sürdürülebilir yaşam katkısı

🛍️ NE TAKAS EDEBİLİRSİNİZ:
• Ev eşyaları ve dekorasyon
• Giyim ve aksesuar
• Kitap ve dergi
• Elektronik cihazlar
• Oyuncak ve oyun
• Bahçe araçları
• Ve daha fazlası...

🔒 GÜVENLİK ÖNCELİĞİMİZ:
• Kimlik doğrulama sistemi
• Güvenilir kullanıcı puanları
• Şikâyet ve raporlama sistemi
• Güvenli mesajlaşma altyapısı

🌱 ÇEVRE DOSTU YAKLAŞIM:
Gereksiz tüketimi azaltarak çevreye katkıda bulunun. Bir kişinin atığı, başka birinin ihtiyacı olabilir! Sürdürülebilir bir yaşam tarzını benimseyin.

İndirin, komşularınızla tanışın ve çevre dostu bir yaşam tarzına geçin! 🌍

📧 Destek: support@eskici.app
🌐 Web: https://eskici.app
```

### 4. Required Assets

#### App Icon
✅ **Ready:** `assets/icon.png`
- Size: 1024x1024 pixels
- Format: PNG (without transparency)
- Current: AI mandala design (blue-gold theme)

#### Screenshots (Required)
📱 **For iPhone 6.7" Display:**
- Size: 1290 x 2796 pixels
- Minimum: 3 screenshots
- Maximum: 10 screenshots

📱 **For iPhone 5.5" Display:**
- Size: 1242 x 2208 pixels
- Minimum: 3 screenshots
- Maximum: 10 screenshots

🔧 **Use our generator:** `screenshot-generator.html`

#### App Previews (Optional but Recommended)
- Video previews of app functionality
- Length: 15-30 seconds
- Portrait orientation recommended

### 5. Build Upload Process

#### Method 1: Using EAS Submit (Recommended)
```bash
# Install EAS CLI if not already installed
npm install -g @expo/eas-cli

# Submit to App Store Connect
eas submit --platform ios --latest

# Or submit specific build
eas submit --platform ios --id d4ae4539-f535-4dc7-8a84-a858e5e4f3b3
```

#### Method 2: Manual Upload via Transporter
1. Download IPA: https://expo.dev/artifacts/eas/sgeNMSEZiLwdLrZ6ETqyn2.ipa
2. Install Apple Transporter from Mac App Store
3. Open Transporter → Sign in with Apple ID
4. Drag and drop the IPA file
5. Click "Deliver"

#### Method 3: Xcode Upload
1. Download IPA file
2. Open Xcode
3. Window → Organizer
4. Click "+" → "Add App..."
5. Select the IPA file
6. Click "Distribute" → "App Store Connect"

### 6. TestFlight Configuration

#### Internal Testing (Instant)
- Up to 100 internal testers
- No Apple review required
- Immediate access after upload

```
Internal Testing Group: ESKICI Team
Testers: Add by email
Auto-notify: Yes
```

#### External Testing (Apple Review)
- Up to 10,000 external testers
- Requires Apple review (1-3 days)
- Public link sharing possible

```
External Testing Group: Beta Testers
Test Information:
- What to Test: Core takas functionality, messaging, user registration
- Feedback Email: support@eskici.app
- Test Details: Test all main features including listing items, messaging, and completing trades
```

### 7. Release Notes for TestFlight

```
🎉 ESKICI v1.3.1 - TestFlight Beta

✨ Yeni Özellikler:
• Geliştirilmiş UI/UX tasarım
• AI-powered ikon sistemi
• Optimized performance
• Enhanced security measures

🔧 İyileştirmeler:
• Daha hızlı yükleme süreleri
• Geliştirilmiş mesajlaşma sistemi
• Daha iyi konum servisleri
• Kararlılık artışları

🧪 Test Edilecek Özellikler:
• Kullanıcı kaydı ve giriş
• Ürün listeleme ve fotoğraf yükleme
• Mesajlaşma sistemi
• Takas teklif sistemi
• Profil yönetimi

📧 Geri Bildirim:
Herhangi bir sorun veya öneri için: support@eskici.app

Teşekkürler! 🙏
```

### 8. Privacy Information

#### Data Types Collected:
```
Contact Info:
- Email Address ✅
- Name ✅
- Phone Number ✅

Identifiers:
- User ID ✅
- Device ID ✅

Location:
- Precise Location ✅
- Coarse Location ✅

User Content:
- Photos ✅
- Messages ✅
- Other User Content ✅

Usage Data:
- Product Interaction ✅
- App Interactions ✅
```

#### Data Usage:
```
Third-Party Advertising: No
Analytics: Yes (Firebase)
Product Personalization: Yes
App Functionality: Yes
```

### 9. Export Compliance

```
Available on French App Store: Yes
Uses Encryption: Yes (Standard iOS encryption)
Exempt from Export Compliance: Yes
Contains proprietary encryption: No
```

### 10. Content Rights Declaration

```
Does your app contain, display, or access third-party content? No
Does your app use the advertising identifier (IDFA)? No
Does your app contain media that autoplay with sound? No
```

## 🚀 Quick Start Commands

### Submit Build to TestFlight:
```bash
# Make sure you're in the project directory
cd "c:\Users\AVM1\Documents\ESKICI\barter-mvp-expo"

# Submit latest iOS build to App Store Connect
eas submit --platform ios --latest

# Or submit specific build ID
eas submit --platform ios --id d4ae4539-f535-4dc7-8a84-a858e5e4f3b3
```

### Check Build Status:
```bash
# Check recent iOS builds
eas build:list --platform ios --limit 5

# Check submission status
eas submission:list --platform ios
```

## ⏰ Expected Timeline

1. **Build Upload:** 5-15 minutes (via EAS)
2. **Processing:** 10-30 minutes (App Store Connect)
3. **Internal TestFlight:** Immediate (no review)
4. **External TestFlight:** 1-3 days (Apple review)
5. **App Store Review:** 1-7 days (for full release)

## 🔗 Important Links

- **App Store Connect:** https://appstoreconnect.apple.com
- **TestFlight:** https://testflight.apple.com
- **Build URL:** https://expo.dev/artifacts/eas/sgeNMSEZiLwdLrZ6ETqyn2.ipa
- **Developer Guidelines:** https://developer.apple.com/app-store/review/guidelines/

## 📋 Pre-Submission Checklist

- [ ] App Store Connect app created
- [ ] App information completed
- [ ] Screenshots uploaded (3+ required)
- [ ] App icon uploaded (1024x1024)
- [ ] Description and keywords set
- [ ] Privacy policy URL provided
- [ ] Build uploaded and processed
- [ ] TestFlight beta information completed
- [ ] Internal testers added
- [ ] Test instructions provided

## 🎯 Next Steps After Upload

1. **Test on TestFlight** - Verify all functionality works
2. **Gather Feedback** - From internal testers
3. **Fix Issues** - If any critical bugs found
4. **External Testing** - Expand to more testers
5. **App Store Submission** - When ready for public release

---

🎊 **Ready to launch ESKICI on TestFlight!** 🎊

Use the command below to submit your build:
```bash
eas submit --platform ios --latest
```