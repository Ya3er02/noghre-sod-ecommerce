import OpenAI from 'openai';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface ConversationContext {
  userId: string;
  history: ChatMessage[];
  metadata?: {
    language: 'fa' | 'ar' | 'en';
    userType: 'customer' | 'seller';
    orderId?: string;
    productId?: string;
  };
}

/**
 * سرویس پشتیبانی مشتریان با AI
 */
export class CustomerSupportAI {
  private openai: OpenAI;
  private readonly systemPrompts = {
    fa: `شما یک دستیار هوشمند پلتفرم نقره سود هستید.

اطلاعات مهم درباره پلتفرم:
- ضمانت بازخرید 100% با قیمت روز بازار
- همه محصولات دارای شماره سریال یکتا
- قیمت‌گذاری بر اساس نرخ جهانی نقره
- ارسال رایگان برای سفارش‌های بالای 10 میلیون تومان
- پشتیبانی 24/7
- امکان فروش محصولات نقره خود بر روی پلتفرم

دستورالعمل‌ها:
1. به سوالات مشتریان با دقت، صبر و حرفه‌ای پاسخ دهید
2. اگر نیاز به اطلاعات بیشتر دارید، از کاربر بپرسید
3. در صورت عدم اطمینان، موضوع را به تیم پشتیبانی انسانی ارجاع دهید
4. همیشه مثبت و حرفه‌ای باشید
5. پاسخ‌های کوتاه و مفید بدهید`,

    ar: `أنت مساعد ذكي لمنصة نقرة سود.

معلومات مهمة عن المنصة:
- ضمان إعادة الشراء 100٪ بسعر السوق
- جميع المنتجات لها رقم تسلسلي فريد
- التسعير بناءً على السعر العالمي للفضة
- شحن مجاني للطلبات فوق 10 مليون تومان
- دعم 24/7
- إمكانية بيع منتجات الفضة على المنصة

التعليمات:
1. أجب على أسئلة العملاء بدقة وصبر واحترافية
2. اسأل لمزيد من المعلومات إذا لزم الأمر
3. حوّل إلى فريق الدعم البشري إذا لم تكن متأكدًا
4. كن إيجابيًا ومحترفًا دائمًا
5. قدم إجابات قصيرة ومفيدة`,

    en: `You are an intelligent assistant for Noghre Sood platform.

Important platform information:
- 100% buyback guarantee at market price
- All products have unique serial numbers
- Pricing based on global silver rates
- Free shipping for orders above 10 million Tomans
- 24/7 support
- Sellers can list their silver products

Instructions:
1. Answer customer questions accurately, patiently, and professionally
2. Ask for more information if needed
3. Escalate to human support if uncertain
4. Always be positive and professional
5. Provide concise and helpful responses`,
  };

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * پردازش سوال مشتری
   */
  async handleCustomerQuery(
    query: string,
    context: ConversationContext
  ): Promise<{
    response: string;
    shouldEscalate: boolean;
    suggestedActions?: string[];
  }> {
    try {
      const language = context.metadata?.language || 'fa';
      const systemPrompt = this.systemPrompts[language];

      // آماده‌سازی پیام‌ها
      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...context.history.slice(-10), // فقط 10 پیام آخر
        { role: 'user', content: query },
      ];

      // فراخوانی AI
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: messages as any,
        temperature: 0.7,
        max_tokens: 500,
      });

      const aiResponse = response.choices[0].message.content || '';

      // تشخیص نیاز به ارجاع به پشتیبانی انسانی
      const shouldEscalate = this.shouldEscalateToHuman(query, aiResponse);

      // اقدامات پیشنهادی
      const suggestedActions = this.generateSuggestedActions(query, context);

      return {
        response: aiResponse,
        shouldEscalate,
        suggestedActions,
      };
    } catch (error) {
      console.error('Customer support AI error:', error);
      throw new Error('خطا در پردازش پیام');
    }
  }

  /**
   * تشخیص نیاز به ارجاع
   */
  private shouldEscalateToHuman(query: string, response: string): boolean {
    const escalationKeywords = [
      'complaint',
      'refund',
      'fraud',
      'legal',
      'manager',
      'شکایت',
      'بازگشت وجه',
      'کلاهبرداری',
      'مدیر',
      'حقوقی',
    ];

    const lowerQuery = query.toLowerCase();
    const lowerResponse = response.toLowerCase();

    // بررسی کلمات کلیدی
    const hasEscalationKeyword = escalationKeywords.some(
      keyword => lowerQuery.includes(keyword) || lowerResponse.includes(keyword)
    );

    // بررسی عدم اطمینان AI
    const uncertaintyPhrases = [
      'نمی‌دانم',
      'مطمئن نیستم',
      "i don't know",
      "i'm not sure",
      "uncertain",
    ];

    const isUncertain = uncertaintyPhrases.some(phrase =>
      lowerResponse.includes(phrase)
    );

    return hasEscalationKeyword || isUncertain;
  }

  /**
   * تولید اقدامات پیشنهادی
   */
  private generateSuggestedActions(
    query: string,
    context: ConversationContext
  ): string[] {
    const actions: string[] = [];

    // بر اساس محتوای سوال
    if (query.includes('سفارش') || query.includes('order')) {
      actions.push('view_orders');
    }

    if (query.includes('محصول') || query.includes('product')) {
      actions.push('browse_products');
    }

    if (query.includes('قیمت') || query.includes('price')) {
      actions.push('view_price');
    }

    if (query.includes('تماس') || query.includes('contact')) {
      actions.push('contact_support');
    }

    return actions;
  }

  /**
   * تحلیل نظرات مشتریان
   */
  async analyzeSentiment(
    text: string
  ): Promise<'positive' | 'neutral' | 'negative'> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `Analyze the sentiment of this text and respond with only one word: positive, neutral, or negative.\n\nText: "${text}"`,
          },
        ],
        temperature: 0.3,
        max_tokens: 10,
      });

      const sentiment = response.choices[0].message.content
        ?.toLowerCase()
        .trim() as 'positive' | 'neutral' | 'negative';

      return sentiment || 'neutral';
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return 'neutral';
    }
  }

  /**
   * تولید پاسخ‌واره‌های آماده برای FAQ
   */
  async generateFAQAnswers(
    questions: string[],
    language: 'fa' | 'ar' | 'en' = 'fa'
  ): Promise<Array<{ question: string; answer: string }>> {
    const results: Array<{ question: string; answer: string }> = [];

    for (const question of questions) {
      try {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4-turbo',
          messages: [
            {
              role: 'system',
              content: this.systemPrompts[language],
            },
            {
              role: 'user',
              content: question,
            },
          ],
          temperature: 0.7,
          max_tokens: 300,
        });

        results.push({
          question,
          answer: response.choices[0].message.content || '',
        });
      } catch (error) {
        console.error(`FAQ generation error for "${question}":`, error);
        results.push({
          question,
          answer: 'خطا در تولید پاسخ',
        });
      }
    }

    return results;
  }
}

// Singleton instance
export const customerSupportAI = new CustomerSupportAI();
