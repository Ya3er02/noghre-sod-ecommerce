import axios from 'axios';

export interface SilverPrice {
  usd: number; // قیمت به دلار برای هر اونس (31.1 گرم)
  irr: number; // قیمت به ریال
  aed: number; // قیمت به درهم
  perGram: {
    usd: number;
    irr: number;
    aed: number;
  };
  change24h: number; // تغییرات 24 ساعته
  changePercent24h: number;
  lastUpdate: Date;
  source: string;
}

export interface PriceHistory {
  date: Date;
  price: number;
  currency: 'USD' | 'IRR' | 'AED';
}

/**
 * سرویس دریافت قیمت لحظه‌ای نقره
 */
export class SilverPriceService {
  private readonly sources = [
    {
      name: 'Metals-API',
      url: 'https://metals-api.com/api/latest',
      apiKey: process.env.METALS_API_KEY,
      weight: 0.4,
    },
    {
      name: 'MetalPriceAPI',
      url: 'https://api.metalpriceapi.com/v1/latest',
      apiKey: process.env.METAL_PRICE_API_KEY,
      weight: 0.35,
    },
    {
      name: 'GoldAPI',
      url: 'https://www.goldapi.io/api/XAG/USD',
      apiKey: process.env.GOLD_API_KEY,
      weight: 0.25,
    },
  ];

  private cache: Map<string, { value: any; expiry: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 دقیقه

  /**
   * دریافت قیمت لحظه‌ای با cache
   */
  async getCurrentPrice(): Promise<SilverPrice> {
    const cached = this.getFromCache('current_price');
    if (cached) {
      return cached;
    }

    const price = await this.fetchCurrentPrice();
    this.setCache('current_price', price, this.CACHE_DURATION);

    return price;
  }

  /**
   * دریافت قیمت از چند منبع و میانگین‌گیری وزنی
   */
  private async fetchCurrentPrice(): Promise<SilverPrice> {
    const prices = await Promise.allSettled(
      this.sources.map(source => this.fetchFromSource(source))
    );

    // فیلتر کردن نتایج موفق
    const successfulPrices = prices
      .filter((result): result is PromiseFulfilledResult<{ usd: number; weight: number }> => 
        result.status === 'fulfilled'
      )
      .map(result => result.value);

    if (successfulPrices.length === 0) {
      throw new Error('خطا در دریافت قیمت از تمام منابع');
    }

    // میانگین وزنی
    const totalWeight = successfulPrices.reduce((sum, p) => sum + p.weight, 0);
    const avgUSD = successfulPrices.reduce(
      (sum, p) => sum + (p.usd * p.weight / totalWeight),
      0
    );

    // دریافت نرخ تبدیل ارز
    const exchangeRates = await this.getExchangeRates();

    // محاسبه قیمت به ازای هر گرم
    const OUNCE_TO_GRAM = 31.1034768;
    const perGramUSD = avgUSD / OUNCE_TO_GRAM;

    // دریافت تغییرات 24 ساعته
    const change = await this.calculate24hChange(avgUSD);

    return {
      usd: avgUSD,
      irr: avgUSD * exchangeRates.USD_IRR,
      aed: avgUSD * exchangeRates.USD_AED,
      perGram: {
        usd: perGramUSD,
        irr: perGramUSD * exchangeRates.USD_IRR,
        aed: perGramUSD * exchangeRates.USD_AED,
      },
      change24h: change.absolute,
      changePercent24h: change.percent,
      lastUpdate: new Date(),
      source: 'aggregated',
    };
  }

  /**
   * دریافت قیمت از یک منبع خاص
   */
  private async fetchFromSource(
    source: typeof this.sources[0]
  ): Promise<{ usd: number; weight: number }> {
    try {
      const response = await axios.get(source.url, {
        params: {
          access_key: source.apiKey,
          base: 'USD',
          symbols: 'XAG',
        },
        headers: {
          'x-access-token': source.apiKey,
        },
        timeout: 5000,
      });

      const usdPrice = this.parseResponse(response.data, source.name);

      return {
        usd: usdPrice,
        weight: source.weight,
      };
    } catch (error) {
      console.error(`Failed to fetch from ${source.name}:`, error);
      throw error;
    }
  }

  /**
   * Parse کردن پاسخ API بر اساس منبع
   */
  private parseResponse(data: any, sourceName: string): number {
    switch (sourceName) {
      case 'Metals-API':
        // برگردانده 1/rate چون به صورت معکوس است
        return 1 / data.rates.XAG;

      case 'MetalPriceAPI':
        return data.rates.XAG;

      case 'GoldAPI':
        return data.price;

      default:
        throw new Error(`Unknown source: ${sourceName}`);
    }
  }

  /**
   * دریافت نرخ تبدیل ارز
   */
  private async getExchangeRates(): Promise<Record<string, number>> {
    const cached = this.getFromCache('exchange_rates');
    if (cached) {
      return cached;
    }

    try {
      const response = await axios.get(
        'https://api.exchangerate-api.com/v4/latest/USD',
        { timeout: 5000 }
      );

      const rates = {
        USD_IRR: response.data.rates.IRR || 580000, // fallback
        USD_AED: response.data.rates.AED || 3.67,
      };

      this.setCache('exchange_rates', rates, 60 * 60 * 1000); // 1 ساعت

      return rates;
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      // Fallback rates
      return {
        USD_IRR: 580000,
        USD_AED: 3.67,
      };
    }
  }

  /**
   * محاسبه تغییرات 24 ساعته
   */
  private async calculate24hChange(
    currentPrice: number
  ): Promise<{ absolute: number; percent: number }> {
    // TODO: ذخیره قیمت‌ها در دیتابیس و مقایسه با 24 ساعت قبل
    const previousPrice = currentPrice * 0.98; // Mock data

    const absolute = currentPrice - previousPrice;
    const percent = (absolute / previousPrice) * 100;

    return { absolute, percent };
  }

  /**
   * دریافت تاریخچه قیمت
   */
  async getPriceHistory(
    days: number = 30,
    currency: 'USD' | 'IRR' | 'AED' = 'USD'
  ): Promise<PriceHistory[]> {
    // TODO: دریافت از دیتابیس
    // فعلاً Mock data
    const history: PriceHistory[] = [];
    const currentPrice = (await this.getCurrentPrice()).usd;

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      history.push({
        date,
        price: currentPrice * (0.95 + Math.random() * 0.1),
        currency,
      });
    }

    return history;
  }

  /**
   * Cache helpers
   */
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);

    if (cached && cached.expiry > Date.now()) {
      return cached.value as T;
    }

    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, value: any, duration: number): void {
    this.cache.set(key, {
      value,
      expiry: Date.now() + duration,
    });
  }
}

// Singleton instance
export const silverPriceService = new SilverPriceService();
