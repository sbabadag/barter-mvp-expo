@echo off
echo 🎨 ESKICI - Manual Icon Replacement Helper
echo =========================================
echo.

:: Check if download exists
set "iconDownload=%USERPROFILE%\Downloads\icon.png"

if exist "%iconDownload%" (
    echo ✅ İndirilen icon.png bulundu!
    echo 📁 Konum: %iconDownload%
    echo.
    
    :: Create backup
    echo 🔄 Backup oluşturuluyor...
    if not exist "assets\backup_old_icons" mkdir "assets\backup_old_icons"
    copy "assets\icon.png" "assets\backup_old_icons\icon-backup-%date:~-4,4%-%date:~-10,2%-%date:~-7,2%-%time:~0,2%-%time:~3,2%.png" >nul 2>&1
    echo ✅ Backup tamamlandı
    echo.
    
    :: Replace icons
    echo 🔄 Icon'lar değiştiriliyor...
    copy "%iconDownload%" "assets\icon.png" >nul
    copy "%iconDownload%" "assets\adaptive-icon.png" >nul
    
    if %errorlevel% == 0 (
        echo ✅ Icon'lar başarıyla değiştirildi!
        echo   - assets\icon.png ✓
        echo   - assets\adaptive-icon.png ✓
        echo.
        
        :: Clean up download
        del "%iconDownload%" >nul 2>&1
        echo 🧹 İndirilen dosya temizlendi
        echo.
        
        :: Show file info
        echo 📊 Yeni icon bilgileri:
        dir "assets\icon.png" | findstr "icon.png"
        echo.
        
        echo 🚀 Cache temizleme başlatılıyor...
        echo.
        npx expo start --clear
        
    ) else (
        echo ❌ Icon kopyalama hatası!
        echo 💡 Manuel olarak kopyalayın:
        echo    Kaynak: %iconDownload%
        echo    Hedef: assets\icon.png ve assets\adaptive-icon.png
    )
    
) else (
    echo ❌ İndirilen icon.png bulunamadı
    echo 📍 Beklenen konum: %iconDownload%
    echo.
    echo 💡 Adımlar:
    echo 1. direct-icon-replacer.html'i açın
    echo 2. "🎯 İndir ve Değiştir" butonuna tıklayın  
    echo 3. Bu scripti tekrar çalıştırın
    echo.
)

echo.
echo 📱 Icon değişimi tamamlandığında uygulamanızı test edin!
pause