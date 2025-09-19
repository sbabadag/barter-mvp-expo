@echo off
echo 🔧 ESKICI - Android Build Fix: Splash Screen Assets
echo ==================================================
echo.

echo 📁 Checking Android drawable directories...
set "res_path=android\app\src\main\res"

if not exist "%res_path%\drawable" (
    echo ❌ Android drawable directory not found
    echo 💡 Run: npx expo prebuild --platform android
    pause
    exit
)

echo ✅ Android directories found

echo.
echo 🎨 Copying splash screen logo to all density folders...

:: Copy splash logo from icon to all necessary locations
copy "assets\icon.png" "%res_path%\drawable\splashscreen_logo.png" >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Main drawable: splashscreen_logo.png
) else (
    echo ❌ Failed to copy to main drawable
)

:: Copy to all density folders
for %%d in (hdpi mdpi xhdpi xxhdpi xxxhdpi) do (
    copy "assets\icon.png" "%res_path%\drawable-%%d\splashscreen_logo.png" >nul 2>&1
    if %errorlevel% == 0 (
        echo ✅ drawable-%%d: splashscreen_logo.png
    ) else (
        echo ❌ Failed to copy to drawable-%%d
    )
)

echo.
echo 📊 Verifying file sizes...
if exist "%res_path%\drawable\splashscreen_logo.png" (
    dir "%res_path%\drawable\splashscreen_logo.png" | findstr "splashscreen_logo.png"
) else (
    echo ❌ Main splash logo missing
)

echo.
echo 🚀 Android build should now work!
echo.
echo 💡 Next steps:
echo 1. eas build --platform android
echo 2. Or: cd android && .\gradlew assembleRelease
echo.

pause