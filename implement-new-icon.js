const fs = require('fs');
const path = require('path');

async function implementNewIcon() {
  console.log('🎨 Yeni AI icon\'u ana icon olarak ayarlıyor...');
  
  // Create backup of current icon
  const currentIconPath = path.join(__dirname, 'assets', 'icon.png');
  const backupDir = path.join(__dirname, 'assets', 'backup_old_icons');
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  // Backup current icon with timestamp
  if (fs.existsSync(currentIconPath)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `icon-backup-${timestamp}.png`);
    fs.copyFileSync(currentIconPath, backupPath);
    console.log(`✅ Mevcut icon yedeklendi: ${backupPath}`);
  }
  
  console.log('\\n📋 Yeni icon\'u uygulamak için:');
  console.log('1. Yeni icon dosyasını "new-ai-icon.png" olarak assets/ klasörüne kaydedin');
  console.log('2. Bu scripti çalıştırın: node implement-new-icon.js');
  console.log('\\n💡 Ya da manuel olarak:');
  console.log('- new-ai-icon.png dosyasını assets/icon.png olarak yeniden adlandırın');
  
  // Check if new icon file exists
  const newIconPath = path.join(__dirname, 'assets', 'new-ai-icon.png');
  
  if (fs.existsSync(newIconPath)) {
    console.log('\\n🔄 Yeni icon dosyası bulundu! Değiştiriliyor...');
    
    // Replace the current icon
    fs.copyFileSync(newIconPath, currentIconPath);
    console.log('✅ Icon başarıyla değiştirildi!');
    
    // Also update adaptive icon if it exists
    const adaptiveIconPath = path.join(__dirname, 'assets', 'adaptive-icon.png');
    if (fs.existsSync(adaptiveIconPath)) {
      fs.copyFileSync(newIconPath, adaptiveIconPath);
      console.log('✅ Adaptive icon da güncellendi!');
    }
    
    console.log('\\n🚀 Sonraki adımlar:');
    console.log('1. Expo uygulamasını yeniden başlatın');
    console.log('2. Değişikliği görmek için cache\'i temizleyin');
    console.log('3. Yeni build alın: eas build');
    
  } else {
    console.log('\\n⚠️  new-ai-icon.png dosyası bulunamadı.');
    console.log('Lütfen yeni icon\'u assets/new-ai-icon.png olarak kaydedin.');
  }
}

implementNewIcon();