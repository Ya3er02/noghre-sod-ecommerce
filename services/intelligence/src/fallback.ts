/**
 * Fallback Mechanism for AI Service
 * Provides mock data when Gemini API is unavailable
 * Ensures "graceful degradation" - app doesn't crash, just uses canned responses
 */

const MOCK_TRENDS: Record<string, string> = {
  '1H': `Based on the hourly data, silver is trading within a tight range with moderate volatility. The market shows mixed sentiment with slight bullish pressure. Key resistance at $32.50/oz and support at $31.80/oz. Trading recommendation: Range-bound strategy with careful stops. Risk: Moderate.`,

  '1D': `Daily analysis shows silver consolidating after a recent uptrend. The price action suggests buyers are in control, but momentum is slowing. Average price: $32.15/oz. Watch for breakout above $32.75/oz for confirmation of bullish continuation. Recommendation: Hold long positions with stops at $31.50/oz. Risk: Low to Moderate.`,

  '7D': `Weekly chart reveals a strong uptrend with higher highs and higher lows. Silver has broken above the 50-day moving average, indicating bullish sentiment. Price volatility is moderate. Forecast: Continued upside pressure if $31.00/oz holds. Recommendation: Accumulate on dips to $31.50/oz. Risk: Low.`,

  '30D': `Monthly analysis shows silver in a recovery phase after previous correction. The trend is bullish with increasing trading volume. Key resistance at $33.50/oz, support at $30.00/oz. Economic factors favoring precious metals. Recommendation: Medium-term buy on weakness. Risk: Low to Moderate.`,

  '1Y': `Annual perspective shows silver trending higher with strong fundamentals. Inflation concerns and geopolitical tensions support prices. The asset has broken above the 200-month moving average. Long-term outlook: BULLISH. Recommendation: Buy and hold for long-term investors. Risk: Low.`,

  'general': `Silver remains an attractive precious metal investment. Market factors: central bank policies, USD strength, inflation expectations, and industrial demand. Current sentiment is mixed but leaning bullish. Diversify silver holdings across bars, coins, and ETFs. Always use risk management.`,
};

const MOCK_ADVICE: Record<string, string> = {
  'buying-silver': `When buying physical silver, consider: 1) Premium over spot price (typically 10-20% for coins, 5-10% for bars), 2) Dealer reputation and buyback terms, 3) Storage options (home safe, bank vault, or allocated storage), 4) Insurance costs. Recommended: Mix of 999.9 bullion and numismatic coins for diversification.`,

  'silver-investment': `Silver offers portfolio diversification, hedge against inflation, and industrial demand support. Consider allocating 5-10% of portfolio to precious metals. Options: Physical silver, silver ETFs, mining stocks, or futures. Balance risk tolerance with growth objectives.`,

  'price-forecast': `Silver price is influenced by: 1) USD strength (inverse relationship), 2) Real interest rates, 3) Inflation expectations, 4) Geopolitical tensions, 5) Industrial demand from electronics/solar. Current sentiment: Moderately bullish. Near-term: $31-33/oz, Medium-term: $33-36/oz target.`,

  'storage': `Physical silver storage options: 1) Home safe ($500-2000) - convenient but insurance expensive, 2) Bank safe deposit box ($20-100/year) - secure but limited access, 3) Allocated storage facility ($3-5 per $1000 value) - professional, insured, best for large amounts.`,

  'tax': `Silver tax implications vary by location. Generally: 1) Capital gains tax on profits when selling, 2) Physical silver often classified as collectible with special tax rates, 3) Inheritance treated as estate asset. Consult a tax professional for your jurisdiction.`,

  'general': `Silver is a precious metal with dual nature: 1) Store of value (like gold), 2) Industrial commodity (electronics, solar, medical). Both aspects support long-term demand. Current market sentiment is moderately positive. Diversification with gold recommended.`,
};

/**
 * Get mock trend analysis
 * @param period - Analysis period (1H, 1D, 7D, 30D, 1Y, or general)
 * @returns Mock analysis string
 */
export function getMockTrendAnalysis(period: string): string {
  return MOCK_TRENDS[period] || MOCK_TRENDS['general'];
}

/**
 * Get mock silver advice
 * @param topic - Topic of advice (buying-silver, investment, etc.)
 * @returns Mock advice string
 */
export function getMockSilverAdvice(topic: string = 'general'): string {
  // Try exact match first
  if (topic in MOCK_ADVICE) {
    return MOCK_ADVICE[topic];
  }

  // Try to match partial keywords
  const lowerTopic = topic.toLowerCase();
  if (
    lowerTopic.includes('buy') ||
    lowerTopic.includes('purchase') ||
    lowerTopic.includes('invest')
  ) {
    return MOCK_ADVICE['buying-silver'];
  }
  if (
    lowerTopic.includes('price') ||
    lowerTopic.includes('forecast') ||
    lowerTopic.includes('trend')
  ) {
    return MOCK_ADVICE['price-forecast'];
  }
  if (lowerTopic.includes('store') || lowerTopic.includes('keep')) {
    return MOCK_ADVICE['storage'];
  }
  if (lowerTopic.includes('tax') || lowerTopic.includes('profit')) {
    return MOCK_ADVICE['tax'];
  }

  // Default
  return MOCK_ADVICE['general'];
}

/**
 * Check if we're in fallback mode
 */
export function isUsingFallback(): boolean {
  return process.env.FALLBACK_MODE === 'enabled' || !process.env.GEMINI_API_KEY;
}

/**
 * Generate a random delay to simulate AI processing
 */
export async function simulateAIDelay(min = 500, max = 1500): Promise<void> {
  const delay = Math.random() * (max - min) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
}
