# AI Service Setup Instructions

## Current Status
- ✅ App is working correctly 
- ❌ AI item recognition is disabled (no OpenAI API key)
- ✅ Users can still create listings manually

## To Enable AI Features:

### Step 1: Get OpenAI API Key
1. Go to https://platform.openai.com/
2. Create account or sign in
3. Go to API Keys section
4. Create new API key
5. Copy the key (starts with "sk-...")

### Step 2: Create .env file
1. In project root, create file named `.env`
2. Add this line:
```
EXPO_PUBLIC_OPENAI_API_KEY=your-actual-api-key-here
```

### Step 3: Restart App
```bash
npx expo start --clear
```

## AI Features (when enabled):
- 🤖 Automatic category detection
- 📝 Smart title suggestions  
- 📄 Automatic descriptions
- 🏷️ Condition assessment
- 💰 Price estimates

## Cost Information:
- OpenAI Vision API: ~$0.01-0.02 per image
- Only charged when AI analysis is used
- Users can still create listings without AI

## Alternative: 
Keep AI disabled - app works perfectly without it!
Users just fill in listing details manually.