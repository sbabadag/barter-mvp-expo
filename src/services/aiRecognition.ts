import * as FileSystem from "expo-file-system/legacy";

// Types for AI recognition results
export interface AIRecognitionResult {
  category: string;
  confidence: number;
  suggestedTitle: string;
  suggestedDescription: string;
  detectedObjects: string[];
  condition?: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  estimatedPrice?: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface AIAnalysisOptions {
  includeCondition?: boolean;
  includePricing?: boolean;
  language?: 'tr' | 'en';
}

// Category mapping for Turkish marketplace
const CATEGORY_MAPPING: Record<string, string> = {
  'clothing': 'Giyim',
  'shoes': 'Ayakkabı',
  'electronics': 'Elektronik',
  'phone': 'Elektronik',
  'laptop': 'Elektronik',
  'book': 'Kitap & Dergi',
  'furniture': 'Mobilya',
  'kitchen': 'Ev & Yaşam',
  'appliance': 'Ev & Yaşam',
  'toy': 'Oyuncak',
  'jewelry': 'Aksesuar',
  'bag': 'Çanta',
  'watch': 'Aksesuar',
  'vehicle': 'Araç',
  'bicycle': 'Spor & Outdoor',
  'sports': 'Spor & Outdoor',
  'cosmetics': 'Kozmetik',
  'home_decor': 'Ev & Yaşam',
  'garden': 'Bahçe',
  'tools': 'Araç Gereç',
  'musical_instrument': 'Müzik',
  'art': 'Sanat & Koleksiyon'
};

// OpenAI Vision API integration
class AIRecognitionService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';

  constructor() {
    // In production, this should come from environment variables
    this.apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
  }

  private async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw new Error('Failed to process image');
    }
  }

  private createAnalysisPrompt(options: AIAnalysisOptions): string {
    const language = options.language === 'tr' ? 'Turkish' : 'English';
    
    return `Analyze this item image and provide the following information in ${language}:

1. Item Category: Choose the most appropriate category from these options:
   - Giyim (Clothing)
   - Ayakkabı (Shoes)
   - Elektronik (Electronics)
   - Kitap & Dergi (Books & Magazines)
   - Mobilya (Furniture)
   - Ev & Yaşam (Home & Living)
   - Oyuncak (Toys)
   - Aksesuar (Accessories)
   - Çanta (Bags)
   - Araç (Vehicles)
   - Spor & Outdoor (Sports & Outdoor)
   - Kozmetik (Cosmetics)
   - Bahçe (Garden)
   - Araç Gereç (Tools)
   - Müzik (Music)
   - Sanat & Koleksiyon (Art & Collection)

2. Suggested Title: A short, descriptive title (max 50 characters)
3. Suggested Description: A detailed description (50-200 characters)
4. Detected Objects: List main objects/items visible
${options.includeCondition ? '5. Condition: Estimate condition (new/like_new/good/fair/poor)' : ''}
${options.includePricing ? '6. Price Range: Estimate price range in Turkish Lira (TRY)' : ''}

Respond in JSON format only:
{
  "category": "category_name",
  "confidence": 0.85,
  "suggestedTitle": "title",
  "suggestedDescription": "description",
  "detectedObjects": ["object1", "object2"],
  ${options.includeCondition ? '"condition": "good",' : ''}
  ${options.includePricing ? '"estimatedPrice": {"min": 100, "max": 300, "currency": "TRY"}' : ''}
}`;
  }

  async analyzeImage(
    imageUri: string, 
    options: AIAnalysisOptions = {}
  ): Promise<AIRecognitionResult> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      console.log('🔍 Starting AI image analysis...');
      
      // Convert image to base64
      const base64Image = await this.convertImageToBase64(imageUri);
      
      // Prepare the API request
      const requestBody = {
        model: "gpt-4o-mini", // Using the more cost-effective model
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: this.createAnalysisPrompt(options)
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: "low" // Use low detail to reduce costs
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.3 // Lower temperature for more consistent results
      };

      console.log('📡 Sending request to OpenAI Vision API...');
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenAI API Error:', errorData);
        throw new Error(`OpenAI API request failed: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response content from OpenAI API');
      }

      console.log('✅ Received AI analysis response');
      
      // Parse the JSON response
      try {
        // Clean the response - remove markdown code blocks if present
        let cleanContent = content.trim();
        if (cleanContent.startsWith('```json')) {
          cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanContent.startsWith('```')) {
          cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        const result = JSON.parse(cleanContent) as AIRecognitionResult;
        
        // Validate and ensure we have required fields
        if (!result.category || !result.suggestedTitle) {
          throw new Error('Invalid AI response format');
        }

        console.log('🎯 AI Recognition Result:', {
          category: result.category,
          title: result.suggestedTitle,
          confidence: result.confidence
        });

        return result;
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        console.log('Raw response:', content);
        throw new Error('Failed to parse AI response');
      }

    } catch (error) {
      console.error('AI Recognition Error:', error);
      throw error;
    }
  }

  // Fallback method using local image analysis (basic)
  async analyzeImageLocally(imageUri: string): Promise<AIRecognitionResult> {
    console.log('📱 Using local image analysis fallback...');
    
    // This is a basic fallback that tries to guess based on filename or returns generic results
    const filename = imageUri.toLowerCase();
    
    let category = 'Ev & Yaşam'; // Default category
    let suggestedTitle = 'İkinci El Ürün';
    
    // Basic pattern matching
    if (filename.includes('cloth') || filename.includes('shirt') || filename.includes('dress')) {
      category = 'Giyim';
      suggestedTitle = 'Giyim Ürünü';
    } else if (filename.includes('phone') || filename.includes('laptop') || filename.includes('electronic')) {
      category = 'Elektronik';
      suggestedTitle = 'Elektronik Ürün';
    } else if (filename.includes('book')) {
      category = 'Kitap & Dergi';
      suggestedTitle = 'Kitap';
    } else if (filename.includes('shoe')) {
      category = 'Ayakkabı';
      suggestedTitle = 'Ayakkabı';
    }

    return {
      category,
      confidence: 0.3, // Low confidence for fallback
      suggestedTitle,
      suggestedDescription: 'İkinci el durumda, temiz ve kullanışlı.',
      detectedObjects: ['genel_ürün'],
      condition: 'good'
    };
  }

  // Main public method that tries AI first, then falls back to local analysis
  async recognizeItem(
    imageUri: string, 
    options: AIAnalysisOptions = { language: 'tr', includeCondition: true }
  ): Promise<AIRecognitionResult> {
    try {
      // Try AI recognition first
      return await this.analyzeImage(imageUri, options);
    } catch (error) {
      console.warn('AI recognition failed, using fallback:', error);
      // Fall back to local analysis
      return await this.analyzeImageLocally(imageUri);
    }
  }
}

// Export singleton instance
export const aiRecognitionService = new AIRecognitionService();

// Helper function to validate if AI service is available
export const isAIServiceAvailable = (): boolean => {
  const hasApiKey = !!process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!hasApiKey) {
    console.log('ℹ️ AI service not configured: OpenAI API key not found');
    console.log('📝 Users can still create listings manually');
    console.log('🤖 To enable AI features, see AI_SETUP_GUIDE.md');
  }
  return hasApiKey;
};

// Helper function to format AI suggestions for UI display
export const formatAISuggestions = (result: AIRecognitionResult) => {
  return {
    title: `🤖 AI Önerisi: ${result.suggestedTitle}`,
    description: result.suggestedDescription,
    category: result.category,
    confidence: Math.round(result.confidence * 100),
    objects: result.detectedObjects.join(', '),
    condition: result.condition,
    priceRange: result.estimatedPrice 
      ? `${result.estimatedPrice.min}-${result.estimatedPrice.max} ${result.estimatedPrice.currency}`
      : undefined
  };
};