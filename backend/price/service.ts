import { api } from 'encore.dev/api';
import { CronJob } from 'encore.dev/cron';
import { SQLDatabase } from 'encore.dev/storage/sqldb';
import * as path from 'path';

// Use __dirname to ensure correct path resolution
const db = new SQLDatabase('price', {
  migrations: path.join(__dirname, 'migrations'),
});

/**
 * Silver Price Service
 * 
 * Implements real-time pricing strategy:
 * - Fetches global silver spot price
 * - Converts to Iranian Toman
 * - Updates every 60 seconds via cron
 * - Stores historical data
 */

export interface SilverPrice {
  usd: number; // Price per troy ounce in USD
  irt: number; // Price per gram in Iranian Toman
  timestamp: Date;
  change24h: number;
  changePercent24h: number;
}

export interface PriceHistory {
  timestamp: Date;
  price: number;
}

// Wrapper interface for history response (Encore requirement)
export interface PriceHistoryResponse {
  data: PriceHistory[];
  period: string;
  count: number;
}

// Store latest price in memory for fast access
let latestPrice: SilverPrice | null = null;

/**
 * Get Current Silver Spot Price
 */
export const getSilverSpot = api(
  { expose: true, method: 'GET', path: '/prices/silver' },
  async (): Promise<SilverPrice> => {
    if (latestPrice) {
      return latestPrice;
    }

    // If not in memory, fetch from database
    const result = await db.query(
      'SELECT * FROM silver_prices ORDER BY timestamp DESC LIMIT 1'
    );

    if (result.rows.length === 0) {
      // If no data, fetch immediately
      await updateSilverPrice();
      return latestPrice!;
    }

    latestPrice = mapRowToSilverPrice(result.rows[0]);
    return latestPrice;
  }
);

/**
 * Get Historical Silver Price Data
 * Fixed: Wrapped array return in interface to satisfy Encore type requirements
 */
export const getSilverHistory = api(
  { expose: true, method: 'GET', path: '/prices/silver/history' },
  async ({ period = '7d' }: { period?: '24h' | '7d' | '30d' | '1y' }): Promise<PriceHistoryResponse> => {
    let interval: string;
    let duration: string;

    switch (period) {
      case '24h':
        interval = '1 hour';
        duration = '24 hours';
        break;
      case '7d':
        interval = '6 hours';
        duration = '7 days';
        break;
      case '30d':
        interval = '1 day';
        duration = '30 days';
        break;
      case '1y':
        interval = '1 week';
        duration = '1 year';
        break;
    }

    const result = await db.query(
      `SELECT 
         time_bucket($1::interval, timestamp) AS bucket,
         AVG(price_irt) as price
       FROM silver_prices
       WHERE timestamp >= NOW() - $2::interval
       GROUP BY bucket
       ORDER BY bucket ASC`,
      [interval, duration]
    );

    const data = result.rows.map((row) => ({
      timestamp: new Date(row.bucket),
      price: parseFloat(row.price),
    }));

    return {
      data,
      period,
      count: data.length,
    };
  }
);

/**
 * Calculate Product Price based on Silver Spot
 */
export const calculateProductPrice = api(
  { expose: true, method: 'POST', path: '/prices/calculate' },
  async ({
    weight,
    purity = '925',
    craftingCostPercent = 20,
    markupPercent = 30,
  }: {
    weight: number;
    purity?: '925' | '999';
    craftingCostPercent?: number;
    markupPercent?: number;
  }): Promise<{
    silverValue: number;
    craftingCost: number;
    markup: number;
    finalPrice: number;
    pricePerGram: number;
  }> => {
    const silverPrice = await getSilverSpot();

    // Calculate pure silver content
    const purityMultiplier = purity === '925' ? 0.925 : 0.999;
    const pureSilverGrams = weight * purityMultiplier;

    // Silver value in IRT (price per gram)
    const silverValue = pureSilverGrams * silverPrice.irt;

    // Crafting cost
    const craftingCost = silverValue * (craftingCostPercent / 100);

    // Business markup
    const markup = (silverValue + craftingCost) * (markupPercent / 100);

    // Final price (rounded to nearest 1000)
    const finalPrice = Math.round((silverValue + craftingCost + markup) / 1000) * 1000;

    return {
      silverValue,
      craftingCost,
      markup,
      finalPrice,
      pricePerGram: finalPrice / weight,
    };
  }
);

/**
 * Cron Job: Update Silver Price Every Minute
 */
const _ = new CronJob('update-silver-price', {
  title: 'Update Silver Spot Price',
  every: '1min',
  endpoint: updateSilverPrice,
});

async function updateSilverPrice(): Promise<void> {
  try {
    // Fetch from external API (example: metals-api.com)
    // In production, use real API with authentication
    const response = await fetch(
      'https://api.metals.live/v1/spot/silver'
    );

    if (!response.ok) {
      console.error('Failed to fetch silver price');
      return;
    }

    const data = await response.json();
    const usdPrice = data.price; // Price per troy ounce in USD

    // Get USD to IRT exchange rate (example: from exchangerate-api.com)
    const exchangeResponse = await fetch(
      'https://api.exchangerate-api.com/v4/latest/USD'
    );
    const exchangeData = await exchangeResponse.json();
    const usdToIrt = exchangeData.rates.IRR || 500000; // Fallback rate

    // Calculate price per gram in IRT
    const pricePerGramUsd = usdPrice / 31.1035; // Troy ounce to gram
    const pricePerGramIrt = pricePerGramUsd * usdToIrt;

    // Get 24h change
    const yesterdayResult = await db.query(
      `SELECT price_irt FROM silver_prices 
       WHERE timestamp <= NOW() - INTERVAL '24 hours'
       ORDER BY timestamp DESC LIMIT 1`
    );

    let change24h = 0;
    let changePercent24h = 0;

    if (yesterdayResult.rows.length > 0) {
      const yesterdayPrice = parseFloat(yesterdayResult.rows[0].price_irt);
      change24h = pricePerGramIrt - yesterdayPrice;
      changePercent24h = (change24h / yesterdayPrice) * 100;
    }

    // Store in database
    await db.query(
      `INSERT INTO silver_prices (price_usd, price_irt, change_24h, change_percent_24h)
       VALUES ($1, $2, $3, $4)`,
      [usdPrice, pricePerGramIrt, change24h, changePercent24h]
    );

    // Update in-memory cache
    latestPrice = {
      usd: usdPrice,
      irt: pricePerGramIrt,
      timestamp: new Date(),
      change24h,
      changePercent24h,
    };

    console.log('Silver price updated:', latestPrice);
  } catch (error) {
    console.error('Error updating silver price:', error);
  }
}

// Helper function
function mapRowToSilverPrice(row: any): SilverPrice {
  return {
    usd: parseFloat(row.price_usd),
    irt: parseFloat(row.price_irt),
    timestamp: new Date(row.timestamp),
    change24h: parseFloat(row.change_24h || 0),
    changePercent24h: parseFloat(row.change_percent_24h || 0),
  };
}
