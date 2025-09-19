@echo off
echo 🚀 ESKICI - TestFlight Deployment Script
echo =========================================
echo.

echo 📋 Current Status Check...
echo.

REM Check current version
echo 📱 Checking app.json version...
findstr "version" app.json

echo.
echo 🔨 Building and Submitting to TestFlight...
echo.

REM Build for iOS
echo ⏳ Starting iOS production build...
call eas build --platform ios --profile production --non-interactive

if %ERRORLEVEL% neq 0 (
    echo ❌ Build failed! Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo ✅ Build completed successfully!
echo.

REM Submit to TestFlight
echo 📲 Submitting to TestFlight...
call eas submit --platform ios --latest --non-interactive

if %ERRORLEVEL% neq 0 (
    echo ❌ Submission failed! The build might already exist.
    echo 💡 Try incrementing the build number in app.json
    pause
    exit /b 1
)

echo.
echo 🎉 Successfully submitted to TestFlight!
echo.
echo 📱 Next steps:
echo 1. Go to App Store Connect: https://appstoreconnect.apple.com
echo 2. Navigate to TestFlight section
echo 3. Add internal testers
echo 4. Create external test group (if needed)
echo 5. Test the app thoroughly
echo.
echo ⏰ Processing time: 10-30 minutes for TestFlight availability
echo.
pause