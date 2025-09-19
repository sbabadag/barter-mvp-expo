const fs = require('fs');
const path = require('path');

// Since we have OpenAI API key, let's create a comprehensive icon generation guide
// that leverages AI tools and the existing setup

async function createAIIconGenerator() {
  console.log('🎨 AI Icon Generator için ESKICI uygulaması');
  
  // Create ai-icons directory
  const aiIconsDir = path.join(__dirname, 'ai-icons');
  if (!fs.existsSync(aiIconsDir)) {
    fs.mkdirSync(aiIconsDir, { recursive: true });
  }
  
  // Create comprehensive prompts for AI icon generation
  const iconPrompts = {
    main_concept: "ESKICI - Turkish barter and second-hand marketplace app",
    
    detailed_prompts: [
      {
        style: "Modern Minimalist",
        prompt: "Create a clean, modern app icon for ESKICI (Turkish for 'old/second-hand dealer'). The icon should represent bartering, exchange, and sustainability. Use a circular or rounded square design with a gradient from blue to green, symbolizing trust and environmental consciousness. Include subtle elements like arrows forming a circle (representing exchange), or two hands exchanging items. The design should be simple enough to be recognizable at small sizes (16px) but detailed enough for larger displays.",
        colors: "Blue to green gradient (#439BEB to #4FFFB0)",
        elements: "Exchange arrows, handshake, recycling symbol"
      },
      
      {
        style: "Playful Geometric",
        prompt: "Design a friendly, approachable app icon for a Turkish marketplace app called ESKICI. Create geometric shapes that represent exchange and community - perhaps overlapping circles, interlocking squares, or a stylized shopping bag with exchange arrows. Use warm, inviting colors with a modern gradient. The icon should feel trustworthy and sustainable, appealing to environmentally conscious users who enjoy second-hand shopping and bartering.",
        colors: "Warm gradient with blues and greens",
        elements: "Geometric shapes, shopping elements, community symbols"
      },
      
      {
        style: "Symbolic Badge",
        prompt: "Create a badge-style app icon for ESKICI that combines traditional Turkish design elements with modern app iconography. Include symbols of trade, exchange, and sustainability. Think of a modern interpretation of a traditional marketplace or bazaar symbol, with contemporary app design principles. Use a sophisticated color palette that conveys trust and quality.",
        colors: "Deep blues, emerald greens, gold accents",
        elements: "Badge design, traditional meets modern, marketplace symbols"
      },
      
      {
        style: "Icon with Typography",
        prompt: "Design an app icon that incorporates the letter 'E' for ESKICI in a creative way. The 'E' could be formed by exchange arrows, or integrated into a symbol representing recycling, sustainability, or community exchange. Use modern typography with clean lines and a premium feel. The overall design should work well on various backgrounds and sizes.",
        colors: "Monochromatic with gradient accents",
        elements: "Letter E, typography, clean lines"
      }
    ],
    
    technical_specs: {
      sizes: ["1024x1024", "512x512", "256x256", "128x128", "64x64", "32x32", "16x16"],
      formats: ["PNG", "SVG", "ICO"],
      requirements: "No text in small sizes, recognizable at 16px, works on light and dark backgrounds"
    }
  };
  
  // Save prompts for AI tools
  fs.writeFileSync(
    path.join(aiIconsDir, 'ai-prompts.json'),
    JSON.stringify(iconPrompts, null, 2)
  );
  
  // Create HTML interface for AI icon generation
  const aiIconGeneratorHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>🎨 AI Icon Generator - ESKICI</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            padding: 20px; 
            max-width: 1200px; 
            margin: 0 auto; 
            background: linear-gradient(135deg, #439BEB 0%, #4FFFB0 100%);
            min-height: 100vh;
        }
        .container {
            background: white;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .prompt-card { 
            border: 1px solid #e0e0e0; 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 12px; 
            background: #f9f9f9;
        }
        .style-header {
            color: #439BEB;
            font-size: 1.4em;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .prompt-text {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #4FFFB0;
            margin: 10px 0;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            line-height: 1.5;
        }
        .copy-btn { 
            background: #439BEB; 
            color: white; 
            padding: 8px 16px; 
            border: none; 
            border-radius: 6px; 
            cursor: pointer; 
            font-size: 0.9em;
            margin: 5px;
        }
        .copy-btn:hover { 
            background: #357abd; 
        }
        .tools-section {
            background: linear-gradient(45deg, #f0f8ff, #f0fff0);
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
        }
        .tool-link {
            display: inline-block;
            background: #4FFFB0;
            color: #333;
            padding: 10px 20px;
            margin: 5px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
        }
        .tool-link:hover {
            background: #3ee89f;
        }
        .current-icon {
            text-align: center;
            margin: 20px 0;
            padding: 20px;
            background: #f0f8ff;
            border-radius: 12px;
        }
        .specs {
            background: #fff3cd;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #ffc107;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 AI Icon Generator - ESKICI App</h1>
        <p><strong>Proje:</strong> Türkiye'nin takas ve ikinci el marketplace uygulaması</p>
        
        <div class="current-icon">
            <h3>📱 Mevcut Icon</h3>
            <img src="../assets/icon.png" alt="Current ESKICI Icon" style="max-width: 150px; border-radius: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.2);">
            <p><em>Mevcut gradient shopping bag tasarımı</em></p>
        </div>
        
        <div class="tools-section">
            <h2>🛠️ Önerilen AI Araçları</h2>
            <a href="https://www.midjourney.com" class="tool-link">Midjourney</a>
            <a href="https://openai.com/dall-e-2" class="tool-link">DALL-E 2</a>
            <a href="https://www.canva.com/ai-image-generator/" class="tool-link">Canva AI</a>
            <a href="https://firefly.adobe.com" class="tool-link">Adobe Firefly</a>
            <a href="https://www.leonardo.ai" class="tool-link">Leonardo AI</a>
            <a href="https://clipdrop.co" class="tool-link">Clipdrop</a>
        </div>
        
        <h2>🎯 AI Icon Prompts</h2>
        <p>Aşağıdaki promptları AI araçlarında kullanarak ESKICI için yeni icon tasarımları oluşturun:</p>
        
        ${iconPrompts.detailed_prompts.map(prompt => `
            <div class="prompt-card">
                <div class="style-header">${prompt.style}</div>
                <div class="prompt-text">${prompt.prompt}</div>
                <div style="margin-top: 10px;">
                    <strong>Renkler:</strong> ${prompt.colors}<br>
                    <strong>Elementler:</strong> ${prompt.elements}
                </div>
                <button class="copy-btn" onclick="copyToClipboard('${prompt.prompt.replace(/'/g, "\\'")}')">
                    📋 Prompt'u Kopyala
                </button>
            </div>
        `).join('')}
        
        <div class="specs">
            <h3>📐 Teknik Özellikler</h3>
            <ul>
                <li><strong>Ana boyut:</strong> 1024x1024 (high-res için)</li>
                <li><strong>Google Play:</strong> 512x512 PNG (alpha channel yok)</li>
                <li><strong>iOS:</strong> 1024x1024 PNG</li>
                <li><strong>Format:</strong> PNG, SVG (vektör için)</li>
                <li><strong>Görünürlük:</strong> 16px boyutunda bile tanınabilir</li>
                <li><strong>Arka plan:</strong> Hem açık hem koyu arka planlarda çalışmalı</li>
                <li><strong>Metin:</strong> Küçük boyutlarda metin olmamalı</li>
            </ul>
        </div>
        
        <div class="prompt-card">
            <h3>💡 Kullanım Talimatları</h3>
            <ol>
                <li>Yukarıdaki AI araçlarından birini seçin</li>
                <li>Beğendiğiniz prompt stilini kopyalayın</li>
                <li>AI aracında prompt'u kullanarak icon oluşturun</li>
                <li>1024x1024 boyutunda PNG olarak indirin</li>
                <li>Icon'u assets/ klasörüne kaydedin</li>
                <li>icon-converter.html ile 512x512 Google Play versiyonu oluşturun</li>
            </ol>
        </div>
        
        <div class="tools-section">
            <h3>🔄 İterasyon Önerileri</h3>
            <p>Farklı yaklaşımlar deneyin:</p>
            <ul>
                <li><strong>Renk varyasyonları:</strong> Mavi-yeşil, turuncu-mavi, mor-pembe gradientleri</li>
                <li><strong>Sembol varyasyonları:</strong> Ok çemberi, el sıkışma, alışveriş çantası, geri dönüşüm</li>
                <li><strong>Stil varyasyonları:</strong> Flat design, glassmorphism, neumorphism</li>
                <li><strong>Forma varyasyonları:</strong> Yuvarlak, rounded square, hexagon</li>
            </ul>
        </div>
    </div>

    <script>
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(function() {
                alert('Prompt kopyalandı! AI aracında yapıştırabilirsiniz.');
            }).catch(function(err) {
                console.error('Kopyalama hatası: ', err);
                // Fallback için textarea kullan
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert('Prompt kopyalandı!');
            });
        }
        
        // Sayfa yüklendiğinde mevcut icon'u kontrol et
        window.onload = function() {
            const img = document.querySelector('.current-icon img');
            img.onerror = function() {
                this.style.display = 'none';
                this.nextElementSibling.textContent = 'Mevcut icon bulunamadı - yeni icon oluşturun!';
            };
        };
    </script>
</body>
</html>
  `;
  
  fs.writeFileSync(path.join(aiIconsDir, 'ai-icon-generator.html'), aiIconGeneratorHTML);
  
  // Create a simple prompt text file for quick copy-paste
  const simplePrompts = iconPrompts.detailed_prompts.map(p => 
    `${p.style}:\n${p.prompt}\n\nColors: ${p.colors}\nElements: ${p.elements}\n\n---\n\n`
  ).join('');
  
  fs.writeFileSync(path.join(aiIconsDir, 'prompts.txt'), simplePrompts);
  
  // Create icon comparison template
  const comparisonHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Icon Comparison - ESKICI</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .icon-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .icon-card { border: 1px solid #ddd; padding: 20px; text-align: center; border-radius: 12px; }
        .icon-preview { width: 128px; height: 128px; border-radius: 20px; margin: 10px auto; background: #f0f0f0; }
        .upload-area { border: 2px dashed #ccc; padding: 20px; margin: 10px 0; border-radius: 8px; }
    </style>
</head>
<body>
    <h1>🎨 ESKICI Icon Karşılaştırması</h1>
    
    <div class="icon-grid">
        <div class="icon-card">
            <h3>Mevcut Icon</h3>
            <img src="../assets/icon.png" class="icon-preview" alt="Current Icon">
            <p>Gradient shopping bag</p>
        </div>
        
        <div class="icon-card">
            <h3>AI Generated #1</h3>
            <div class="upload-area">
                <input type="file" accept="image/*" onchange="previewIcon(this, 1)">
                <p>AI ile oluşturulan icon yükleyin</p>
            </div>
            <img id="preview1" class="icon-preview" style="display:none;">
        </div>
        
        <div class="icon-card">
            <h3>AI Generated #2</h3>
            <div class="upload-area">
                <input type="file" accept="image/*" onchange="previewIcon(this, 2)">
                <p>AI ile oluşturulan icon yükleyin</p>
            </div>
            <img id="preview2" class="icon-preview" style="display:none;">
        </div>
        
        <div class="icon-card">
            <h3>AI Generated #3</h3>
            <div class="upload-area">
                <input type="file" accept="image/*" onchange="previewIcon(this, 3)">
                <p>AI ile oluşturulan icon yükleyin</p>
            </div>
            <img id="preview3" class="icon-preview" style="display:none;">
        </div>
    </div>
    
    <script>
        function previewIcon(input, num) {
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = document.getElementById('preview' + num);
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(input.files[0]);
            }
        }
    </script>
</body>
</html>
  `;
  
  fs.writeFileSync(path.join(aiIconsDir, 'icon-comparison.html'), comparisonHTML);
  
  console.log('✅ AI Icon Generator hazırlandı!');
  console.log('\n📁 Oluşturulan dosyalar:');
  console.log('  🎨 ai-icon-generator.html - AI prompts ve araçlar');
  console.log('  📋 prompts.txt - Kopyalanabilir promptlar');
  console.log('  🔍 icon-comparison.html - Icon karşılaştırma aracı');
  console.log('  📄 ai-prompts.json - Detaylı prompt verileri');
  
  console.log('\n🚀 Kullanım adımları:');
  console.log('  1. ai-icon-generator.html dosyasını tarayıcıda aç');
  console.log('  2. Beğendiğin prompt stilini seç ve kopyala');
  console.log('  3. Midjourney, DALL-E, Canva AI vb. araçlardan birini kullan');
  console.log('  4. Oluşturulan iconları icon-comparison.html ile karşılaştır');
  console.log('  5. En iyi olanı assets/ klasörüne kaydet');
  
  console.log('\n💡 Önerilen AI araçları:');
  console.log('  • Midjourney (en kaliteli sonuçlar)');
  console.log('  • DALL-E 2 (OpenAI - API keyin var)');
  console.log('  • Canva AI (ücretsiz seçenekler)');
  console.log('  • Adobe Firefly (profesyonel kalite)');
}

createAIIconGenerator();