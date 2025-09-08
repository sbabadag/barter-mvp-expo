const fs = require('fs');

// Create SVG splash screen
function createSplashScreen() {
    console.log('Creating İmece splash screen...');
    
    const splashSvg = `<svg width="1242" height="2688" viewBox="0 0 1242 2688" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background gradient -->
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f0a500;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#ff8c00;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f0a500;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f5f5f5;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="1242" height="2688" fill="url(#bgGradient)"/>
  
  <!-- Center content area -->
  <g transform="translate(621, 1344)">
    <!-- Main logo circle -->
    <circle cx="0" cy="-100" r="120" fill="url(#textGradient)" filter="url(#shadow)"/>
    
    <!-- Exchange arrows inside circle -->
    <!-- Right arrow (top) -->
    <path d="M-60 -120 L60 -120 L40 -140 L60 -120 L40 -100" 
          stroke="#f0a500" 
          stroke-width="8" 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          fill="none"/>
    
    <!-- Left arrow (bottom) -->
    <path d="M60 -80 L-60 -80 L-40 -60 L-60 -80 L-40 -100" 
          stroke="#f0a500" 
          stroke-width="8" 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          fill="none"/>
    
    <!-- Decorative circles -->
    <circle cx="-40" cy="-120" r="8" fill="#f0a500"/>
    <circle cx="40" cy="-80" r="8" fill="#f0a500"/>
    
    <!-- App name -->
    <text x="0" y="80" text-anchor="middle" fill="url(#textGradient)" 
          font-family="Arial, sans-serif" font-size="72" font-weight="bold"
          filter="url(#shadow)">
      İMECE
    </text>
    
    <!-- Subtitle -->
    <text x="0" y="130" text-anchor="middle" fill="url(#textGradient)" 
          font-family="Arial, sans-serif" font-size="24" font-weight="normal"
          opacity="0.9">
      Komşular Arası Platform
    </text>
    
    <!-- Loading indicator area -->
    <g transform="translate(0, 200)">
      <!-- Loading dots -->
      <circle cx="-30" cy="0" r="8" fill="url(#textGradient)" opacity="0.7">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0s"/>
      </circle>
      <circle cx="0" cy="0" r="8" fill="url(#textGradient)" opacity="0.7">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0.5s"/>
      </circle>
      <circle cx="30" cy="0" r="8" fill="url(#textGradient)" opacity="0.7">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="1s"/>
      </circle>
    </g>
  </g>
  
  <!-- Bottom text -->
  <text x="621" y="2500" text-anchor="middle" fill="url(#textGradient)" 
        font-family="Arial, sans-serif" font-size="18" font-weight="normal"
        opacity="0.8">
    Güvenli • Kolay • Komşuluk
  </text>
</svg>`;

    // Write SVG file
    fs.writeFileSync('splash-imece.svg', splashSvg);
    console.log('✅ SVG splash screen created: splash-imece.svg');
    
    // Create HTML preview
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>İmece Splash Screen Preview</title>
    <style>
        body { 
            margin: 0; 
            padding: 20px;
            background: #f0f0f0; 
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .splash-container {
            width: 300px;
            height: 650px;
            border: 2px solid #333;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            background: white;
        }
        .splash-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .instructions {
            margin-top: 20px;
            padding: 20px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 500px;
            text-align: center;
        }
    </style>
</head>
<body>
    <h1>İmece Splash Screen</h1>
    
    <div class="splash-container">
        <img src="splash-imece.svg" alt="İmece Splash" class="splash-image">
    </div>
    
    <div class="instructions">
        <h3>Splash Screen Özellikleri:</h3>
        <ul style="text-align: left;">
            <li>🎨 Turuncu gradient arkaplan</li>
            <li>⚪ Merkezi beyaz logo dairesi</li>
            <li>🔄 Değişim okları</li>
            <li>📱 "İMECE" ana başlık</li>
            <li>🏘️ "Komşular Arası Platform" alt başlık</li>
            <li>💫 Animasyonlu yükleme noktaları</li>
            <li>✨ "Güvenli • Kolay • Komşuluk" alt mesaj</li>
        </ul>
        
        <h3>PNG'ye Dönüştürme:</h3>
        <p>1. Bu SVG'yi sağ tık → "Resmi kaydet"</p>
        <p>2. 1242x2688 boyutunda PNG olarak kaydet</p>
        <p>3. splash.png olarak assets klasörüne kopyala</p>
    </div>
</body>
</html>`;

    fs.writeFileSync('splash-preview.html', htmlContent);
    console.log('✅ HTML preview created: splash-preview.html');
}

// Update app.json with better splash configuration
function updateSplashConfig() {
    const appJsonPath = '../app.json';
    if (fs.existsSync(appJsonPath)) {
        const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
        
        // Update splash configuration
        appJson.expo.splash = {
            "image": "./assets/splash.png",
            "resizeMode": "cover",
            "backgroundColor": "#f0a500"
        };
        
        fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
        console.log('✅ Updated app.json splash configuration');
    }
}

// Run the script
createSplashScreen();
updateSplashConfig();

console.log('\n🎨 İmece splash screen created!');
console.log('📱 Features:');
console.log('   • Responsive design for all screen sizes');
console.log('   • Brand colors (orange gradient)');
console.log('   • Animated loading indicators');
console.log('   • Professional İmece branding');

console.log('\n📋 Next steps:');
console.log('1. Open splash-preview.html in browser');
console.log('2. Right-click and save SVG as PNG (1242x2688)');
console.log('3. Replace assets/splash.png');
console.log('4. Test the app startup');

console.log('\n🚀 Your app will have a beautiful splash screen!');
