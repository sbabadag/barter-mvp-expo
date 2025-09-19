@echo off
echo 🎨 ESKICI Icon Replacement Finalizer
echo ======================================

:: Wait for user to download the icon
echo 📋 Adım 1: auto-icon-converter.html açıldı
echo ⏳ Lütfen "🎯 Ana Icon İndir" butonuna tıklayın ve dosyayı İndirilenler klasörüne kaydedin
echo.
echo İndirme tamamlandığında herhangi bir tuşa basın...
pause >nul

:: Find the downloaded icon
echo.
echo 🔍 İndirilen icon.png dosyası aranıyor...

set "downloadPath=%USERPROFILE%\Downloads\icon.png"
if exist "%downloadPath%" (
    echo ✅ İndirilen icon bulundu: %downloadPath%
    
    :: Backup current icon again (just in case)
    echo 🔄 Son yedek alınıyor...
    copy "assets\icon.png" "assets\backup_old_icons\icon-manual-backup-%date:~-4,4%-%date:~-10,2%-%date:~-7,2%.png" >nul 2>&1
    
    :: Replace the icon
    echo 🔄 Icon değiştiriliyor...
    copy "%downloadPath%" "assets\icon.png" >nul
    if %errorlevel% == 0 (
        echo ✅ Icon başarıyla değiştirildi!
        
        :: Also update adaptive icon
        copy "%downloadPath%" "assets\adaptive-icon.png" >nul
        echo ✅ Adaptive icon da güncellendi!
        
        :: Clean up download
        del "%downloadPath%" >nul 2>&1
        echo 🧹 İndirilen dosya temizlendi
        
    ) else (
        echo ❌ Icon kopyalanamadı. Manuel olarak kopyalayın:
        echo    Kaynak: %downloadPath%
        echo    Hedef: assets\icon.png
    )
    
) else (
    echo ❌ İndirilen icon.png bulunamadı
    echo 💡 Manuel çözüm:
    echo    1. Tarayıcıdan icon.png dosyasını indirin
    echo    2. Bu dosyayı assets\icon.png olarak kaydedin
    echo    3. assets\adaptive-icon.png olarak da kopyalayın
)

echo.
echo 🚀 Cache temizleme ve restart...
echo.
call npx expo start --clear
echo.
echo 🎉 Tüm işlemler tamamlandı!
echo 📱 Uygulamanızı test edin.

pause