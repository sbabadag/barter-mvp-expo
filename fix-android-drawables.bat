@echo off
echo 🔧 ESKICI - Complete Android Drawable Fix
echo ==========================================
echo.

set "res_path=android\app\src\main\res"
set "icon_source=assets\icon.png"

if not exist "%icon_source%" (
    echo ❌ Source icon not found: %icon_source%
    pause
    exit
)

if not exist "%res_path%\drawable" (
    echo ❌ Android drawable directory not found
    echo 💡 Run: npx expo prebuild --platform android
    pause
    exit
)

echo 🎨 Creating all missing drawable resources...
echo.

:: Create all missing drawables
echo ⏳ Creating splashscreen_logo.png...
copy "%icon_source%" "%res_path%\drawable\splashscreen_logo.png" >nul 2>&1
if %errorlevel% == 0 (echo ✅ splashscreen_logo.png created) else (echo ❌ Failed to create splashscreen_logo.png)

echo ⏳ Creating notification_icon.png...
copy "%icon_source%" "%res_path%\drawable\notification_icon.png" >nul 2>&1
if %errorlevel% == 0 (echo ✅ notification_icon.png created) else (echo ❌ Failed to create notification_icon.png)

echo.
echo 📐 Copying to all density folders...

:: Copy to all density folders
for %%d in (hdpi mdpi xhdpi xxhdpi xxxhdpi) do (
    echo ⏳ Processing drawable-%%d...
    
    copy "%icon_source%" "%res_path%\drawable-%%d\splashscreen_logo.png" >nul 2>&1
    if %errorlevel% == 0 (echo   ✅ splashscreen_logo.png) else (echo   ❌ Failed splashscreen_logo.png)
    
    copy "%icon_source%" "%res_path%\drawable-%%d\notification_icon.png" >nul 2>&1
    if %errorlevel% == 0 (echo   ✅ notification_icon.png) else (echo   ❌ Failed notification_icon.png)
)

echo.
echo 📊 Verification:
echo ---------------
if exist "%res_path%\drawable\splashscreen_logo.png" (
    echo ✅ Main splashscreen_logo.png exists
) else (
    echo ❌ Main splashscreen_logo.png missing
)

if exist "%res_path%\drawable\notification_icon.png" (
    echo ✅ Main notification_icon.png exists
) else (
    echo ❌ Main notification_icon.png missing
)

echo.
echo 🚀 Android build should now work!
echo.
echo 💡 Next steps:
echo 1. eas build --platform android
echo 2. Or: cd android && .\gradlew assembleRelease
echo.

pause