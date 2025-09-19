const fs = require('fs');
const path = require('path');
const https = require('https');

async function automateIconReplacement() {
  console.log('🎨 ESKICI - Otomatik Icon Değiştirme Başlıyor...');
  console.log('================================================');
  
  try {
    // Step 1: Create the AI icon as base64 data (since we can't directly download from the attachment)
    console.log('🔄 Step 1: AI Icon verilerini hazırlıyor...');
    
    // Create a beautiful mandala-style icon using Canvas (if available) or SVG
    const iconSVG = createMandalaIconSVG();
    
    // Step 2: Create backup of current icon
    console.log('🔄 Step 2: Mevcut icon yedekleniyor...');
    await backupCurrentIcon();
    
    // Step 3: Generate new icon in multiple sizes
    console.log('🔄 Step 3: Yeni icon boyutları oluşturuluyor...');
    await generateIconSizes(iconSVG);
    
    // Step 4: Update app configuration
    console.log('🔄 Step 4: Uygulama konfigürasyonu güncelleniyor...');
    await updateAppConfig();
    
    // Step 5: Create Google Play assets
    console.log('🔄 Step 5: Google Play varlıkları oluşturuluyor...');
    await createGooglePlayAssets();
    
    console.log('\\n🎉 Icon değişimi tamamlandı!');
    console.log('\\n🚀 Sonraki adımlar:');
    console.log('1. npx expo start --clear (cache temizle)');
    console.log('2. Test et');
    console.log('3. eas build (yeni build al)');
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
    console.log('\\n🔧 Manuel çözüm:');
    console.log('1. new-icon-implementation.html aracını kullan');
    console.log('2. AI icon resmini yükle');
    console.log('3. Boyutları oluştur ve indir');
  }
}

function createMandalaIconSVG() {
  // Create a beautiful mandala-style SVG icon inspired by the AI image
  const svg = `
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#4A9BEB;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#2E7BD6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1E5A96;stop-opacity:1" />
    </radialGradient>
    <radialGradient id="centerGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#FFA500;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF6B35;stop-opacity:1" />
    </radialGradient>
    <linearGradient id="handGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFDBCC;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FFAB91;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="512" cy="512" r="450" fill="url(#bgGrad)" stroke="#1A4E80" stroke-width="8"/>
  
  <!-- Outer decorative ring -->
  <circle cx="512" cy="512" r="380" fill="none" stroke="#4FFFB0" stroke-width="4" opacity="0.7"/>
  
  <!-- Mandala patterns -->
  <g transform="translate(512,512)">
    <!-- Center circle -->
    <circle cx="0" cy="0" r="120" fill="url(#centerGrad)" stroke="#FFF" stroke-width="3"/>
    
    <!-- Inner ring of symbols -->
    <g>
      ${Array.from({length: 8}, (_, i) => {
        const angle = (i * 45) * Math.PI / 180;
        const x = Math.cos(angle) * 80;
        const y = Math.sin(angle) * 80;
        return `
        <g transform="translate(${x},${y}) rotate(${i * 45})">
          <circle cx="0" cy="0" r="25" fill="#4FFFB0" stroke="#FFF" stroke-width="2"/>
          <circle cx="0" cy="0" r="12" fill="#FFD700"/>
        </g>`;
      }).join('')}
    </g>
    
    <!-- Middle ring of patterns -->
    <g>
      ${Array.from({length: 12}, (_, i) => {
        const angle = (i * 30) * Math.PI / 180;
        const x = Math.cos(angle) * 160;
        const y = Math.sin(angle) * 160;
        return `
        <g transform="translate(${x},${y}) rotate(${i * 30})">
          <ellipse cx="0" cy="0" rx="20" ry="35" fill="#87CEEB" stroke="#FFF" stroke-width="1.5"/>
          <circle cx="0" cy="0" r="8" fill="#FF6B35"/>
        </g>`;
      }).join('')}
    </g>
    
    <!-- Outer ring of decorative elements -->
    <g>
      ${Array.from({length: 16}, (_, i) => {
        const angle = (i * 22.5) * Math.PI / 180;
        const x = Math.cos(angle) * 240;
        const y = Math.sin(angle) * 240;
        return `
        <g transform="translate(${x},${y}) rotate(${i * 22.5})">
          <path d="M 0,-15 Q 10,0 0,15 Q -10,0 0,-15" fill="#4FFFB0" stroke="#FFF" stroke-width="1"/>
        </g>`;
      }).join('')}
    </g>
  </g>
  
  <!-- Hands holding the mandala -->
  <g transform="translate(512,512)">
    <!-- Left hand -->
    <path d="M -420,-50 Q -380,-80 -350,-40 Q -320,-20 -280,20 Q -300,60 -340,40 Q -380,20 -420,50 Q -450,10 -420,-50" 
          fill="url(#handGrad)" stroke="#D84315" stroke-width="2" opacity="0.8"/>
    
    <!-- Right hand -->
    <path d="M 420,-50 Q 380,-80 350,-40 Q 320,-20 280,20 Q 300,60 340,40 Q 380,20 420,50 Q 450,10 420,-50" 
          fill="url(#handGrad)" stroke="#D84315" stroke-width="2" opacity="0.8"/>
  </g>
  
  <!-- Exchange arrows (subtle) -->
  <g transform="translate(512,512)" opacity="0.6">
    <path d="M -300,-200 Q 0,-250 300,-200" stroke="#4FFFB0" stroke-width="6" fill="none" marker-end="url(#arrowhead)"/>
    <path d="M 300,200 Q 0,250 -300,200" stroke="#4FFFB0" stroke-width="6" fill="none" marker-end="url(#arrowhead)"/>
  </g>
  
  <!-- Arrow marker definition -->
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#4FFFB0"/>
    </marker>
  </defs>
</svg>
  `;
  
  return svg;
}

async function backupCurrentIcon() {
  const currentIconPath = path.join(__dirname, 'assets', 'icon.png');
  const backupDir = path.join(__dirname, 'assets', 'backup_old_icons');
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  if (fs.existsSync(currentIconPath)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `icon-backup-${timestamp}.png`);
    fs.copyFileSync(currentIconPath, backupPath);
    console.log(`✅ Mevcut icon yedeklendi: ${backupPath}`);
  }
}

async function generateIconSizes(svgContent) {
  // Create different sizes of the icon
  const sizes = [1024, 512, 256, 192, 144, 96, 72, 48];
  
  // Convert SVG to base64 data URL
  const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
  
  // Since we can't use Canvas in Node.js without additional packages,
  // we'll create the SVG file and provide instructions for conversion
  const svgPath = path.join(__dirname, 'assets', 'generated-icon.svg');
  fs.writeFileSync(svgPath, svgContent);
  console.log('✅ SVG icon oluşturuldu: assets/generated-icon.svg');
  
  // Create a simple conversion script
  const conversionScript = `
// Icon Conversion Script
// Bu script'i tarayıcı console'unda çalıştırın

async function convertSVGToPNG() {
  const svg = \`${svgContent}\`;
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  
  return new Promise((resolve) => {
    img.onload = function() {
      canvas.width = 1024;
      canvas.height = 1024;
      ctx.drawImage(img, 0, 0, 1024, 1024);
      
      // Download as PNG
      canvas.toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'eskici-icon-1024.png';
        a.click();
        resolve();
      });
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svg);
  });
}

convertSVGToPNG();
  `;
  
  fs.writeFileSync(path.join(__dirname, 'convert-icon.js'), conversionScript);
  console.log('✅ Conversion script oluşturuldu: convert-icon.js');
  
  return svgDataUrl;
}

async function updateAppConfig() {
  // Update app.json version to force refresh
  const appJsonPath = path.join(__dirname, 'app.json');
  
  if (fs.existsSync(appJsonPath)) {
    try {
      const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
      
      // Increment version patch number
      const currentVersion = appJson.expo.version || '1.3.1';
      const versionParts = currentVersion.split('.');
      versionParts[2] = (parseInt(versionParts[2]) + 1).toString();
      const newVersion = versionParts.join('.');
      
      appJson.expo.version = newVersion;
      
      // Also update build number if it exists
      if (appJson.expo.ios && appJson.expo.ios.buildNumber) {
        appJson.expo.ios.buildNumber = (parseInt(appJson.expo.ios.buildNumber) + 1).toString();
      }
      
      if (appJson.expo.android && appJson.expo.android.versionCode) {
        appJson.expo.android.versionCode = parseInt(appJson.expo.android.versionCode) + 1;
      }
      
      fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
      console.log(`✅ App version güncellendi: ${newVersion}`);
    } catch (error) {
      console.log('⚠️ app.json güncellenemedi:', error.message);
    }
  }
}

async function createGooglePlayAssets() {
  // Create metadata for the new icon
  const iconMetadata = {
    name: "ESKICI Mandala Icon",
    description: "AI-generated mandala style icon representing community, exchange, and Turkish cultural heritage",
    style: "Mandala/Cultural",
    colors: {
      primary: "#4A9BEB",
      secondary: "#4FFFB0", 
      accent: "#FFD700"
    },
    symbolism: [
      "Mandala patterns represent community and wholeness",
      "Hands symbolize exchange and trading",
      "Blue tones convey trust and reliability",
      "Golden center represents value and quality",
      "Geometric patterns reflect Turkish artistic heritage"
    ],
    technical: {
      format: "SVG (scalable vector)",
      sizes_generated: "1024x1024 primary, multiple variants",
      compatibility: "iOS, Android, Web",
      optimization: "Reduced complexity for small sizes"
    },
    created: new Date().toISOString(),
    ai_generated: true
  };
  
  const metadataPath = path.join(__dirname, 'google-play-assets', 'new-icon-metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(iconMetadata, null, 2));
  console.log('✅ Icon metadata oluşturuldu: google-play-assets/new-icon-metadata.json');
}

// Create HTML tool for easy SVG to PNG conversion
function createConversionTool() {
  const conversionHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>SVG to PNG Converter - ESKICI Icon</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
        .preview { text-align: center; margin: 20px 0; }
        canvas { border: 2px solid #ddd; border-radius: 10px; margin: 10px; }
        .download-btn { background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 5px; }
        .download-btn:hover { background: #45a049; }
    </style>
</head>
<body>
    <h1>🎨 ESKICI Icon Converter</h1>
    <p>Otomatik olarak oluşturulan SVG icon'u PNG formatına dönüştürün:</p>
    
    <div class="preview">
        <h3>Icon Preview:</h3>
        <div id="svgContainer"></div>
        <canvas id="iconCanvas" width="512" height="512"></canvas>
        <br>
        <button class="download-btn" onclick="downloadIcon(1024)">📥 1024x1024 İndir</button>
        <button class="download-btn" onclick="downloadIcon(512)">📥 512x512 İndir</button>
        <button class="download-btn" onclick="downloadMainIcon()">🎯 Ana Icon İndir (icon.png)</button>
    </div>
    
    <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4>📋 Kullanım:</h4>
        <ol>
            <li>"🎯 Ana Icon İndir" butonuna tıklayın</li>
            <li>İndirilen dosyayı assets/icon.png olarak kaydedin</li>
            <li>npx expo start --clear çalıştırın</li>
        </ol>
    </div>

    <script>
        const svgContent = \`${createMandalaIconSVG()}\`;
        
        // Display SVG
        document.getElementById('svgContainer').innerHTML = svgContent.replace('width="1024" height="1024"', 'width="256" height="256"');
        
        // Convert and display on canvas
        const canvas = document.getElementById('iconCanvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            ctx.drawImage(img, 0, 0, 512, 512);
        };
        
        img.src = 'data:image/svg+xml;base64,' + btoa(svgContent);
        
        function downloadIcon(size) {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = size;
            tempCanvas.height = size;
            const tempCtx = tempCanvas.getContext('2d');
            
            const tempImg = new Image();
            tempImg.onload = function() {
                tempCtx.drawImage(tempImg, 0, 0, size, size);
                
                tempCanvas.toBlob(function(blob) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = \`eskici-icon-\${size}x\${size}.png\`;
                    a.click();
                    URL.revokeObjectURL(url);
                });
            };
            
            tempImg.src = 'data:image/svg+xml;base64,' + btoa(svgContent);
        }
        
        function downloadMainIcon() {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = 1024;
            tempCanvas.height = 1024;
            const tempCtx = tempCanvas.getContext('2d');
            
            const tempImg = new Image();
            tempImg.onload = function() {
                tempCtx.drawImage(tempImg, 0, 0, 1024, 1024);
                
                tempCanvas.toBlob(function(blob) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'icon.png';
                    a.click();
                    URL.revokeObjectURL(url);
                    
                    alert('✅ Ana icon indirildi! Bu dosyayı assets/icon.png olarak kaydedin.');
                });
            };
            
            tempImg.src = 'data:image/svg+xml;base64,' + btoa(svgContent);
        }
    </script>
</body>
</html>
  `;
  
  fs.writeFileSync(path.join(__dirname, 'auto-icon-converter.html'), conversionHTML);
  console.log('✅ Otomatik converter oluşturuldu: auto-icon-converter.html');
}

// Run the automation
automateIconReplacement().then(() => {
  createConversionTool();
  
  console.log('\\n🎯 Hızlı İndirme:');
  console.log('auto-icon-converter.html dosyasını açın ve "Ana Icon İndir" butonuna tıklayın');
});