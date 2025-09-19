# Icon Update Script for ESKICI Barter App
Write-Host "ESKICI Icon Update Script" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

# Define paths
$assetsPath = ".\assets"
$backupPath = ".\assets\backup_old_icons"

# Create backup directory
if (!(Test-Path $backupPath)) {
    New-Item -Path $backupPath -ItemType Directory
    Write-Host "Created backup directory" -ForegroundColor Green
}

# Backup existing icons
Write-Host "Backing up existing icons..." -ForegroundColor Yellow
if (Test-Path "$assetsPath\icon.png") {
    Copy-Item "$assetsPath\icon.png" "$backupPath\icon_old.png"
    Write-Host "Backed up icon.png" -ForegroundColor Green
}
if (Test-Path "$assetsPath\adaptive-icon.png") {
    Copy-Item "$assetsPath\adaptive-icon.png" "$backupPath\adaptive-icon_old.png"
    Write-Host "Backed up adaptive-icon.png" -ForegroundColor Green
}
if (Test-Path "$assetsPath\splash.png") {
    Copy-Item "$assetsPath\splash.png" "$backupPath\splash_old.png"
    Write-Host "Backed up splash.png" -ForegroundColor Green
}
if (Test-Path "$assetsPath\favicon.png") {
    Copy-Item "$assetsPath\favicon.png" "$backupPath\favicon_old.png"
    Write-Host "Backed up favicon.png" -ForegroundColor Green
}

Write-Host "Backup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "MANUAL STEPS REQUIRED:" -ForegroundColor Magenta
Write-Host "1. Save your 4 new images from the chat attachments" -ForegroundColor White
Write-Host "2. Copy them to the assets folder with these names:" -ForegroundColor White
Write-Host "   - Main icon (shopping bag) -> assets\icon.png" -ForegroundColor Cyan
Write-Host "   - Adaptive icon (shopping bag) -> assets\adaptive-icon.png" -ForegroundColor Cyan  
Write-Host "   - Splash screen (house) -> assets\splash.png" -ForegroundColor Cyan
Write-Host "   - Favicon (shopping bag) -> assets\favicon.png" -ForegroundColor Cyan
Write-Host "3. Run: npx expo start --clear" -ForegroundColor Yellow
Write-Host ""
Write-Host "Recommended Image Mapping:" -ForegroundColor Green
Write-Host "   - Shopping bag with arrows -> Main icon and favicon" -ForegroundColor White
Write-Host "   - House with arrows -> Splash screen" -ForegroundColor White
Write-Host "   - All should be 1024x1024 or larger" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")