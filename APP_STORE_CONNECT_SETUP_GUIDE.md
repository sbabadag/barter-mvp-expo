# App Store Connect Setup Guide

## Overview
App Store Connect is Apple's platform for managing your app submissions, metadata, and App Store presence.

## Prerequisites
- Apple Developer Account (active and paid)
- Built iOS binary (.ipa file)
- App assets (screenshots, descriptions, etc.)

## Step 1: Access App Store Connect

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Sign in with your Apple Developer credentials
3. Navigate to "My Apps"

## Step 2: Create New App

### App Information
- **Platform**: iOS
- **Name**: `ESKICI`
- **Primary Language**: Turkish
- **Bundle ID**: `com.sbabadag.imece` (should be available)
- **SKU**: `eskici-app-v1` (unique identifier for your records)

### Additional Information
- **User Access**: Your team only (initially)

## Step 3: App Store Listing Configuration

### General App Information
```
Name: ESKICI
Subtitle: Komşular Arası Al-Sat Platformu
Category: Shopping
Secondary Category: Lifestyle
Content Rights: No (unless you have content licensing deals)
Age Rating: 4+ (safe for all ages)
```

### App Description (Turkish)
```
ESKICI - komşularınızla kolayca alışveriş yapın!

İkinci el eşyalarınızı satın, ihtiyacınız olanları komşularınızdan alın. Güvenli, hızlı ve komşuluk ilişkilerini güçlendiren bir platform.

🌟 Özellikler:
• Kolay ilan verme sistemi
• Fotoğraflı ürün gösterimi
• Güvenli mesajlaşma
• Konum tabanlı arama ve filtreleme
• Kullanıcı değerlendirme sistemi
• Push bildirimleri

🏠 Neden ESKICI?
✓ Komşularınızla güvenli alışveriş
✓ Çevre dostu geri dönüşüm
✓ Ekonomik çözümler bulun
✓ Yerel topluluk desteği
✓ Güvenilir kullanıcı profilleri

📱 Nasıl Kullanılır:
1. Hesap oluşturun
2. Satmak istediğiniz ürünlerin fotoğrafını çekin
3. İlanınızı yayınlayın
4. Komşularınızdan gelen mesajları yanıtlayın
5. Güvenli buluşma noktalarında değişim yapın

Hemen indirin ve komşularınızla alışverişe başlayın! Hem çevreye katkıda bulunun, hem de ekonomik alışveriş yapın.
```

### App Description (English - for broader reach)
```
ESKICI - Shop easily with your neighbors!

Sell your second-hand items and buy what you need from your neighbors. A safe, fast platform that strengthens neighborhood relationships.

🌟 Features:
• Easy listing creation
• Photo-based product display
• Secure messaging
• Location-based search and filtering
• User rating system
• Push notifications

🏠 Why ESKICI?
✓ Safe shopping with neighbors
✓ Eco-friendly recycling
✓ Find economical solutions
✓ Local community support
✓ Trusted user profiles

📱 How to Use:
1. Create an account
2. Take photos of items you want to sell
3. Publish your listing
4. Respond to messages from neighbors
5. Meet at safe locations for exchange

Download now and start shopping with your neighbors! Contribute to the environment while shopping economically.
```

### Keywords (100 characters max)
```
ikinci el,alışveriş,komşu,satış,al sat,takas,eskici,marketplace,yerel,güvenli
```

### Support Information
```
Support URL: [Create a simple support page or use email]
Marketing URL: [Optional - your website if you have one]
Privacy Policy URL: [Host your privacy policy online]
```

## Step 4: App Pricing and Availability

### Pricing
- **Price**: Free (recommended for marketplace apps)
- **Available in**: Turkey (primary), Add other countries as needed

### Availability Date
- **Automatically release**: After approval (recommended)
- Or set a specific date

## Step 5: Age Rating Questionnaire

Answer these questions for 4+ rating:
- **Cartoon or Fantasy Violence**: None
- **Realistic Violence**: None
- **Sexual Content or Nudity**: None
- **Profanity or Crude Humor**: None
- **Alcohol, Tobacco, or Drug Use**: None
- **Gambling**: None
- **Horror/Fear Themes**: None
- **Mature/Suggestive Themes**: None
- **Uncontrolled Web Access**: No
- **User Generated Content**: Yes (marketplace listings)

## Step 6: Screenshots Required

### iPhone Screenshots (Required Sizes)

**iPhone 6.7" (iPhone 14 Pro Max, 15 Pro Max)**
- Size: 1290 x 2796 pixels
- Screenshots needed: 3-5

**iPhone 6.5" (iPhone 14 Plus, 15 Plus)**
- Size: 1242 x 2688 pixels
- Screenshots needed: 3-5

**iPhone 5.5" (iPhone 8 Plus)**
- Size: 1242 x 2208 pixels
- Screenshots needed: 3-5

### iPad Screenshots (Optional but recommended)

**iPad Pro 12.9"**
- Size: 2048 x 2732 pixels
- Screenshots needed: 3-5

**iPad Pro 11"**
- Size: 1668 x 2388 pixels
- Screenshots needed: 3-5

### Screenshot Content Suggestions
1. **Home/Browse Screen**: Show listings grid
2. **Listing Detail**: Show product photos and description
3. **Create Listing**: Show the posting process
4. **Messages**: Show safe communication
5. **Profile/Account**: Show user profiles

### Screenshot Tips
- Use real content, not placeholder text
- Show the interface in Turkish
- Include your app's unique value proposition
- No device frames needed
- High resolution and clear text

## Step 7: App Preview Video (Optional)
- 15-30 seconds long
- Shows key app functionality
- Portrait orientation
- Various device sizes available

## Step 8: App Icon
- Upload 1024x1024 pixel icon
- Same as your app icon but without rounded corners
- PNG format, no transparency

## Step 9: Copyright and Additional Information

### Copyright
```
2025 [Your Name/Company]
```

### Review Notes (for Apple reviewers)
```
This is a local marketplace app for Turkish communities where neighbors can buy and sell second-hand items. 

Test Account (if needed):
Email: test@example.com
Password: TestPassword123

Key Features to Test:
1. Browse listings without account
2. Create account and verify email
3. Post a listing with photos
4. Search and filter listings
5. Send messages between users
6. View user profiles and ratings

The app promotes environmental sustainability through reuse and strengthens community connections.
```

### App Review Information
```
Contact Information:
First Name: [Your First Name]
Last Name: [Your Last Name]
Phone Number: [Your Phone Number]
Email: sbabadag@gmail.com

Demo Account (if login required):
Username: demo@eskici.app
Password: Demo123456
```

## Step 10: Upload Binary

### Using EAS Submit (Recommended)
```bash
eas submit --platform ios --profile production
```

### Manual Upload
1. Use Xcode or Application Loader
2. Upload your .ipa file
3. Wait for processing (10-60 minutes)
4. Select the build in App Store Connect

## Step 11: Final Review and Submit

### Before Submitting
- [ ] All metadata complete
- [ ] Screenshots uploaded for all required sizes
- [ ] Binary uploaded and processed
- [ ] Age rating completed
- [ ] Pricing set
- [ ] Privacy policy accessible

### Submit for Review
1. Click "Submit for Review"
2. Answer export compliance questions:
   - **Uses Encryption**: No (for most apps)
   - **Available on French App Store**: Yes/No based on availability

## Timeline Expectations

- **App Store Connect Setup**: 2-4 hours
- **Screenshot Creation**: 2-6 hours
- **Binary Upload/Processing**: 30-60 minutes
- **Apple Review**: 24-48 hours (typical)
- **If Rejected**: Address issues and resubmit (usually quick second review)

## Post-Submission

### Monitor Status
- Check App Store Connect for review status
- Respond quickly to any Apple feedback
- Be prepared to make changes if needed

### Common Rejection Reasons (and how to avoid them)
1. **Incomplete Information**: ✅ Following this guide prevents this
2. **Performance Issues**: Test thoroughly before submission
3. **Guideline Violations**: ✅ Your marketplace app should be compliant
4. **Metadata Issues**: ✅ Using appropriate descriptions and keywords

## Success Tips

1. **Test Everything**: Before submission, test all major features
2. **Clear Descriptions**: Make your app's purpose and value clear
3. **Quality Screenshots**: Invest time in good screenshots
4. **Fast Response**: Respond quickly to Apple feedback
5. **Community Guidelines**: Ensure your app promotes positive community interaction

Your ESKICI app is well-positioned for approval with its community-focused marketplace model! 🎉