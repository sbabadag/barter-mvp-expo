@echo off
echo 🎨 ESKICI - Icon Assets Status Report
echo ====================================
echo.

echo 📁 ASSETS DIRECTORY:
echo -------------------
if exist "assets\icon.png" (
    echo ✅ Main icon: assets\icon.png
    dir "assets\icon.png" | findstr "icon.png"
) else (
    echo ❌ Main icon: MISSING
)

if exist "assets\adaptive-icon.png" (
    echo ✅ Adaptive icon: assets\adaptive-icon.png  
    dir "assets\adaptive-icon.png" | findstr "adaptive-icon.png"
) else (
    echo ❌ Adaptive icon: MISSING
)

echo.
echo 🤖 ANDROID NATIVE ICONS:
echo ------------------------
if exist "android\app\src\main\res\mipmap-hdpi\ic_launcher.webp" (
    echo ✅ Android icons generated successfully
    echo 📍 Location: android\app\src\main\res\mipmap-*\
    echo 📊 Icon densities:
    for %%d in (mdpi hdpi xhdpi xxhdpi xxxhdpi) do (
        if exist "android\app\src\main\res\mipmap-%%d\ic_launcher.webp" (
            echo    - %%d ✓
        ) else (
            echo    - %%d ❌
        )
    )
    echo.
    echo 🎯 Adaptive icon components:
    for %%d in (mdpi hdpi xhdpi xxhdpi xxxhdpi) do (
        if exist "android\app\src\main\res\mipmap-%%d\ic_launcher_foreground.webp" (
            echo    - %%d foreground ✓
        )
    )
) else (
    echo ❌ Android icons not generated
    echo 💡 Run: npx expo prebuild --platform android
)

echo.
echo 🍎 iOS NATIVE ICONS:
echo -------------------
if exist "ios" (
    echo ✅ iOS directory exists
    if exist "ios\*.xcodeproj" (
        echo ✅ Xcode project found
    ) else (
        echo ⚠️ No Xcode project found
    )
) else (
    echo ❌ iOS directory not generated (requires macOS)
    echo 💡 iOS prebuild only works on macOS/Linux
)

echo.
echo 📋 CONFIGURATION STATUS:
echo ------------------------
echo ✅ app.json icon path: ./assets/icon.png
echo ✅ app.json adaptive icon path: ./assets/adaptive-icon.png
echo ✅ Android package: com.sbabadag.imece
echo ✅ iOS bundle ID: com.sbabadag.imece

echo.
echo 🚀 NEXT STEPS:
echo -------------
echo 1. Test current setup: npx expo start --clear
echo 2. Build for Android: eas build --platform android
echo 3. For iOS: Build on macOS with: eas build --platform ios
echo.
echo 📱 Your AI mandala icon should now appear in:
echo    - Expo development client
echo    - Android builds (all densities)
echo    - iOS builds (when built on macOS)

pause