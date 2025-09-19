@echo off
echo 🎨 ESKICI - Yeni Icon Uygulama Aracı
echo =====================================

REM Check if new icon file exists
if not exist "new-ai-icon.png" (
    echo ❌ Hata: new-ai-icon.png dosyası bulunamadı!
    echo.
    echo 📋 Yapılacaklar:
    echo 1. Yeni AI icon'unuzu "new-ai-icon.png" olarak bu klasöre kaydedin
    echo 2. Bu script'i tekrar çalıştırın
    echo.
    pause
    exit /b 1
)

echo ✅ Yeni icon dosyası bulundu: new-ai-icon.png

REM Create backup directory
if not exist "assets\backup_old_icons" (
    mkdir "assets\backup_old_icons"
    echo ✅ Backup klasörü oluşturuldu
)

REM Backup current icon
if exist "assets\icon.png" (
    for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
    set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
    set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
    set "timestamp=%YYYY%-%MM%-%DD%_%HH%-%Min%-%Sec%"
    
    copy "assets\icon.png" "assets\backup_old_icons\icon-backup-%timestamp%.png" >nul
    echo ✅ Mevcut icon yedeklendi: icon-backup-%timestamp%.png
)

REM Replace main icon
copy "new-ai-icon.png" "assets\icon.png" >nul
echo ✅ Ana icon güncellendi: assets\icon.png

REM Replace adaptive icon if exists
if exist "assets\adaptive-icon.png" (
    copy "new-ai-icon.png" "assets\adaptive-icon.png" >nul
    echo ✅ Adaptive icon güncellendi: assets\adaptive-icon.png
)

echo.
echo 🎉 Icon başarıyla değiştirildi!
echo.
echo 🚀 Sonraki adımlar:
echo 1. Expo dev server'ı yeniden başlatın: npx expo start --clear
echo 2. Uygulamayı test edin
echo 3. Yeni build alın: eas build
echo.
echo 💡 Google Play Store için 512x512 versiyonu:
echo    google-play-assets\icon-converter.html aracını kullanın
echo.

REM Clean up
del "new-ai-icon.png" >nul 2>&1

pause