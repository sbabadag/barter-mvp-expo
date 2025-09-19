const https = require('https');
const fs = require('fs');
const path = require('path');

// Read OpenAI API key from environment
require('dotenv').config();
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

async function generateIconWithDALLE() {
  console.log('🎨 DALL-E ile ESKICI icon oluşturuluyor...');
  
  if (!OPENAI_API_KEY || OPENAI_API_KEY.includes('placeholder')) {
    console.log('❌ OpenAI API key bulunamadı. .env dosyasını kontrol edin.');
    return;
  }
  
  // Icon prompts for DALL-E
  const iconPrompts = [
    {
      name: "modern-gradient",
      prompt: "A modern, minimalist mobile app icon for a Turkish marketplace called 'ESKICI'. The icon should feature a clean gradient from blue (#439BEB) to green (#4FFFB0). Include subtle exchange arrows forming a circle or two hands exchanging items. The design should be simple, recognizable at small sizes, and convey trust, sustainability, and community exchange. No text. Square format with rounded corners.",
      style: "Modern Gradient"
    },
    {
      name: "geometric-exchange",
      prompt: "A geometric, playful app icon representing bartering and second-hand marketplace. Use interlocking circles or geometric shapes in blue and green colors. Include symbols of exchange like arrows, recycling symbols, or overlapping shopping elements. The design should be friendly, approachable, and modern. No text. Clean lines and shapes that work well at 16px and 1024px sizes.",
      style: "Geometric Exchange"
    },
    {
      name: "sustainable-badge",
      prompt: "A badge-style app icon combining sustainability and marketplace themes. Design should include elements representing recycling, community, and trust. Use deep blue, emerald green, and subtle gold accents. The icon should feel premium and trustworthy, suitable for a Turkish marketplace app focused on second-hand goods and bartering. Circular or hexagonal badge format.",
      style: "Sustainable Badge"
    }
  ];
  
  // Create ai-icons directory if it doesn't exist
  const aiIconsDir = path.join(__dirname, 'ai-icons');
  if (!fs.existsSync(aiIconsDir)) {
    fs.mkdirSync(aiIconsDir, { recursive: true });
  }
  
  console.log('🔄 DALL-E API ile icon oluşturuluyor...');
  console.log('⚠️  Not: Bu işlem birkaç dakika sürebilir ve API kullanımı ücretlidir.');
  
  for (let i = 0; i < iconPrompts.length; i++) {
    const promptData = iconPrompts[i];
    console.log(`\\n🎯 ${i + 1}/${iconPrompts.length}: ${promptData.style} stili oluşturuluyor...`);
    
    try {
      const imageUrl = await callDALLEAPI(promptData.prompt);
      if (imageUrl) {
        await downloadImage(imageUrl, path.join(aiIconsDir, `dalle-icon-${promptData.name}.png`));
        console.log(`✅ Icon kaydedildi: ai-icons/dalle-icon-${promptData.name}.png`);
      }
      
      // Wait between requests to avoid rate limiting
      if (i < iconPrompts.length - 1) {
        console.log('⏳ Sonraki istek için bekleniyor...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
    } catch (error) {
      console.error(`❌ ${promptData.style} için hata:`, error.message);
    }
  }
  
  // Create a results HTML file
  createResultsHTML(iconPrompts);
  
  console.log('\\n🎉 DALL-E icon oluşturma tamamlandı!');
  console.log('📁 Sonuçlar: ai-icons/ klasöründe');
  console.log('🔍 Karşılaştırma: ai-icons/dalle-results.html dosyasını açın');
}

async function callDALLEAPI(prompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "vivid"
    });
    
    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Length': data.length
      }
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          if (response.data && response.data[0] && response.data[0].url) {
            resolve(response.data[0].url);
          } else {
            reject(new Error('API yanıtında image URL bulunamadı'));
          }
        } catch (error) {
          reject(new Error('API yanıtı parse edilemedi: ' + error.message));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error('API isteği başarısız: ' + error.message));
    });
    
    req.write(data);
    req.end();
  });
}

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const fileStream = fs.createWriteStream(filepath);
      res.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      
      fileStream.on('error', (error) => {
        reject(error);
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

function createResultsHTML(prompts) {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>DALL-E Generated Icons - ESKICI</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 15px; }
        .icon-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; margin: 30px 0; }
        .icon-card { 
            border: 2px solid #e0e0e0; 
            padding: 20px; 
            text-align: center; 
            border-radius: 15px; 
            background: #fafafa;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .icon-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .icon-preview { 
            width: 200px; 
            height: 200px; 
            border-radius: 25px; 
            margin: 10px auto; 
            background: #f0f0f0; 
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        .style-name {
            font-size: 1.3em;
            font-weight: bold;
            color: #439BEB;
            margin: 15px 0;
        }
        .download-btn {
            background: #4FFFB0;
            color: #333;
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            margin: 10px;
        }
        .download-btn:hover {
            background: #3ee89f;
        }
        .current-comparison {
            background: linear-gradient(45deg, #439BEB, #4FFFB0);
            color: white;
            padding: 20px;
            border-radius: 15px;
            margin: 20px 0;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 DALL-E Generated Icons - ESKICI</h1>
        <p>OpenAI DALL-E 3 ile oluşturulan ESKICI app iconları</p>
        
        <div class="current-comparison">
            <h3>📱 Mevcut Icon vs AI Generated</h3>
            <p>Aşağıdaki AI-generated iconları mevcut iconla karşılaştırın ve en uygun olanı seçin</p>
        </div>
        
        <div class="icon-grid">
            <div class="icon-card">
                <div class="style-name">Mevcut Icon</div>
                <img src="../assets/icon.png" class="icon-preview" alt="Current Icon" onerror="this.style.display='none';">
                <p>Gradient shopping bag design</p>
            </div>
            
            ${prompts.map(prompt => `
                <div class="icon-card">
                    <div class="style-name">${prompt.style}</div>
                    <img src="dalle-icon-${prompt.name}.png" class="icon-preview" alt="${prompt.style}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Mb2FkaW5nLi4uPC90ZXh0Pjwvc3ZnPg==';">
                    <p>AI Generated: ${prompt.style}</p>
                    <button class="download-btn" onclick="downloadAsAppIcon('dalle-icon-${prompt.name}.png', '${prompt.name}')">
                        📱 App Icon Olarak Kullan
                    </button>
                </div>
            `).join('')}
        </div>
        
        <div class="current-comparison">
            <h3>🚀 Sonraki Adımlar</h3>
            <ol style="text-align: left; max-width: 600px; margin: 0 auto;">
                <li>Beğendiğiniz icon için "App Icon Olarak Kullan" butonuna tıklayın</li>
                <li>İndirilecek icon assets/icon.png olarak kaydedilecek</li>
                <li>google-play-assets/icon-converter.html ile 512x512 versiyonu oluşturun</li>
                <li>Uygulamayı yeniden build edin</li>
            </ol>
        </div>
    </div>

    <script>
        function downloadAsAppIcon(filename, name) {
            // Create a link to download and rename the file
            const link = document.createElement('a');
            link.href = filename;
            link.download = 'eskici-icon-' + name + '.png';
            link.click();
            
            alert('Icon indirildi! Bu dosyayı assets/icon.png olarak kaydedin ve uygulamayı yeniden build edin.');
        }
        
        // Check if images loaded successfully
        window.onload = function() {
            const images = document.querySelectorAll('.icon-preview');
            images.forEach(img => {
                img.addEventListener('error', function() {
                    this.style.background = '#f0f0f0';
                    this.alt = 'Icon oluşturuluyor...';
                });
            });
        };
    </script>
</body>
</html>
  `;
  
  fs.writeFileSync(path.join(__dirname, 'ai-icons', 'dalle-results.html'), html);
}

// Fallback function for manual prompt usage
function showManualInstructions() {
  console.log('\\n🎨 Manuel AI Icon Oluşturma Rehberi');
  console.log('=====================================');
  console.log('\\nOpenAI API kullanımı için aşağıdaki promptları kopyalayıp yapıştırın:');
  console.log('\\n1️⃣ MODERN GRADIENT STYLE:');
  console.log('"A modern, minimalist mobile app icon for a Turkish marketplace called ESKICI. The icon should feature a clean gradient from blue to green. Include subtle exchange arrows forming a circle or two hands exchanging items. The design should be simple, recognizable at small sizes, and convey trust, sustainability, and community exchange. No text. Square format with rounded corners."');
  
  console.log('\\n2️⃣ GEOMETRIC EXCHANGE STYLE:');
  console.log('"A geometric, playful app icon representing bartering and second-hand marketplace. Use interlocking circles or geometric shapes in blue and green colors. Include symbols of exchange like arrows, recycling symbols, or overlapping shopping elements. The design should be friendly, approachable, and modern. No text."');
  
  console.log('\\n3️⃣ SUSTAINABLE BADGE STYLE:');
  console.log('"A badge-style app icon combining sustainability and marketplace themes. Design should include elements representing recycling, community, and trust. Use deep blue, emerald green, and subtle gold accents. The icon should feel premium and trustworthy, suitable for a Turkish marketplace app focused on second-hand goods and bartering."');
  
  console.log('\\n🛠️ Önerilen Araçlar:');
  console.log('• https://openai.com/dall-e-2 (API keyin var!)');
  console.log('• https://www.midjourney.com');
  console.log('• https://www.canva.com/ai-image-generator/');
  console.log('• https://firefly.adobe.com');
  
  console.log('\\n📋 Sonraki adımlar:');
  console.log('1. Promptları AI aracına yapıştır');
  console.log('2. 1024x1024 boyutunda PNG olarak indir');
  console.log('3. assets/icon.png olarak kaydet');
  console.log('4. icon-converter.html ile 512x512 versiyonu oluştur');
}

// Check if we should run DALL-E generation or show manual instructions
if (OPENAI_API_KEY && !OPENAI_API_KEY.includes('placeholder')) {
  console.log('🔑 OpenAI API key bulundu! DALL-E ile otomatik icon oluşturma mevcut.');
  console.log('\\n❓ DALL-E ile otomatik icon oluşturmak ister misiniz?');
  console.log('   Bu işlem API kullanımı gerektirir ve ücretli olabilir.');
  console.log('\\n💡 Alternatif olarak, manuel promptları da kullanabilirsiniz.');
  
  // For safety, show manual instructions by default
  showManualInstructions();
  
  console.log('\\n🤖 Otomatik DALL-E icon oluşturma için:');
  console.log('   node create-dalle-icons.js --generate');
  
} else {
  console.log('⚠️  OpenAI API key bulunamadı. Manuel prompt kullanımı öneriliyor.');
  showManualInstructions();
}

// If --generate flag is passed, run the generation
if (process.argv.includes('--generate')) {
  generateIconWithDALLE();
}