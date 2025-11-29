import OpenAI from 'openai';

export interface ProductAnalysis {
  isAuthentic: boolean;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  hallmarkVisible: boolean;
  concerns: string[];
  condition: string;
  confidence: number;
}

export interface ProductDescription {
  title: string;
  description: string;
  features: string[];
  benefits: string[];
  keywords: string[];
}

/**
 * سرویس تحلیل محصولات با هوش مصنوعی
 */
export class ProductAnalysisAI {
  private openai: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * تحلیل تصاویر محصول برای تایید اصالت
   */
  async analyzeProductImage(imageUrl: string): Promise<ProductAnalysis> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are a silver authentication expert. Analyze this image and provide:
                1. Authenticity assessment (is it likely genuine silver?)
                2. Quality rating (excellent/good/fair/poor)
                3. Hallmark visibility (can you see quality marks?)
                4. Any concerns or red flags
                5. Overall condition
                6. Confidence level (0-100)
                
                Respond ONLY in valid JSON format:
                {
                  "isAuthentic": boolean,
                  "quality": "excellent" | "good" | "fair" | "poor",
                  "hallmarkVisible": boolean,
                  "concerns": ["concern1", "concern2"],
                  "condition": "description",
                  "confidence": number
                }`,
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.3, // Lower temperature for more consistent results
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from AI');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Product analysis error:', error);
      throw new Error('خطا در تحلیل تصویر محصول');
    }
  }

  /**
   * تولید توضیحات محصول با AI
   */
  async generateProductDescription(
    productInfo: {
      name: string;
      category: string;
      weight: number;
      purity: number;
      features?: string[];
    },
    language: 'fa' | 'ar' | 'en' = 'fa'
  ): Promise<ProductDescription> {
    const languageMap = {
      fa: 'فارسی',
      ar: 'عربی',
      en: 'English',
    };

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a professional silver product marketing expert. Write compelling, 
                     accurate product descriptions in ${languageMap[language]}. Be concise but informative.`,
          },
          {
            role: 'user',
            content: `Generate a product description in ${languageMap[language]} for:
            Name: ${productInfo.name}
            Category: ${productInfo.category}
            Weight: ${productInfo.weight} grams
            Purity: ${productInfo.purity} (e.g., 925 for Sterling Silver)
            ${productInfo.features ? `Features: ${productInfo.features.join(', ')}` : ''}
            
            Provide response as JSON:
            {
              "title": "Engaging title",
              "description": "2-3 paragraph description",
              "features": ["feature1", "feature2", "feature3"],
              "benefits": ["benefit1", "benefit2"],
              "keywords": ["keyword1", "keyword2", "keyword3"]
            }`,
          },
        ],
        temperature: 0.7,
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error('No response from AI');

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Invalid JSON response');

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Description generation error:', error);
      throw new Error('خطا در تولید توضیحات');
    }
  }

  /**
   * سیستم پیشنهاد هوشمند محصول
   */
  async recommendProducts(
    userHistory: any[],
    availableProducts: any[],
    limit: number = 5
  ): Promise<any[]> {
    // تحلیل علایق کاربر
    const preferences = this.analyzeUserPreferences(userHistory);

    // امتیازدهی به محصولات
    const scoredProducts = availableProducts.map(product => ({
      ...product,
      score: this.calculateRecommendationScore(product, preferences),
    }));

    // مرتب‌سازی و انتخاب برترین‌ها
    return scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * تحلیل علایق کاربر
   */
  private analyzeUserPreferences(history: any[]) {
    const categoryCount: Record<string, number> = {};
    const priceRange = { min: Infinity, max: 0 };
    let totalWeight = 0;

    history.forEach(item => {
      // دسته‌بندی‌ها
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;

      // محدوده قیمت
      if (item.price < priceRange.min) priceRange.min = item.price;
      if (item.price > priceRange.max) priceRange.max = item.price;

      // میانگین وزن
      totalWeight += item.weight || 0;
    });

    const favoriteCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([cat]) => cat);

    return {
      favoriteCategories,
      priceRange,
      avgWeight: history.length > 0 ? totalWeight / history.length : 0,
    };
  }

  /**
   * محاسبه امتیاز پیشنهاد
   */
  private calculateRecommendationScore(product: any, preferences: any): number {
    let score = 0;

    // امتیاز دسته‌بندی
    if (preferences.favoriteCategories.includes(product.category)) {
      const index = preferences.favoriteCategories.indexOf(product.category);
      score += (3 - index) * 30; // 30, 60, 90 بر اساس اولویت
    }

    // امتیاز قیمت
    if (
      product.price >= preferences.priceRange.min &&
      product.price <= preferences.priceRange.max
    ) {
      score += 40;
    }

    // امتیاز وزن
    const weightDiff = Math.abs(product.weight - preferences.avgWeight);
    score += Math.max(0, 30 - weightDiff * 2);

    return score;
  }

  /**
   * تحلیل نظرات مشتریان (Sentiment Analysis)
   */
  async analyzeReviews(
    reviews: Array<{ text: string; rating: number }>
  ): Promise<{
    sentiment: 'positive' | 'neutral' | 'negative';
    strengths: string[];
    weaknesses: string[];
    themes: string[];
    overallScore: number;
  }> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'user',
            content: `Analyze these product reviews and provide insights in JSON format:
            Reviews:
            ${reviews.map((r, i) => `${i + 1}. Rating: ${r.rating}/5 - "${r.text}"`).join('\n')}
            
            Provide:
            {
              "sentiment": "positive" | "neutral" | "negative",
              "strengths": ["top 3 product strengths"],
              "weaknesses": ["top 2 concerns"],
              "themes": ["recurring topics"],
              "overallScore": number (0-10)
            }`,
          },
        ],
        temperature: 0.5,
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error('No response');

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Invalid JSON');

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Review analysis error:', error);
      throw new Error('خطا در تحلیل نظرات');
    }
  }
}

// Singleton instance
export const productAnalysisAI = new ProductAnalysisAI();
