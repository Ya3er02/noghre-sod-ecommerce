/**
 * AI Agent Service - Google Gemini Integration
 * Provides: Silver Trend Analysis, Market Insights, Price Predictions
 * Uses: Google Gemini 1.5 Flash (Free Tier)
 * Port: 3002
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { CircuitBreakerOpenError, createCircuitBreaker } from '@repo/utils/circuit-breaker';
import { getFeatureFlagsManager } from '@repo/utils/feature-flags';
import { prisma } from '@repo/database';
import { getMockTrendAnalysis, getMockSilverAdvice } from './fallback';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

/**
 * Initialize Gemini AI Client
 */
let genAI: GoogleGenerativeAI | null = null;

if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

/**
 * Circuit breaker for Gemini API calls
 */
const geminiBreaker = createCircuitBreaker('gemini-api');

/**
 * Get the Gemini model instance
 */
function getModel() {
  if (!genAI) {
    throw new Error('Google Generative AI not initialized. Missing API key.');
  }
  return genAI.getGenerativeModel({ model: GEMINI_MODEL });
}

/**
 * Generate Silver Trend Analysis using Gemini
 * @param period - Analysis period ("1H", "1D", "7D", "30D", "1Y")
 * @param priceData - Historical price data
 * @returns Promise<string> - AI-generated analysis
 */
export async function analyzeSilverTrends(period: string, priceData: number[]): Promise<string> {
  const flags = getFeatureFlagsManager();
  const aiEnabled = await flags.isEnabled('FEATURE_AI_ADVISOR');

  if (!aiEnabled) {
    console.log('[AI Agent] AI disabled via feature flag, using fallback');
    return getMockSilverAdvice(period);
  }

  try {
    return await geminiBreaker.execute(async () => {
      if (!genAI) {
        throw new Error('Gemini not initialized');
      }

      const model = getModel();
      const avgPrice = priceData.reduce((a, b) => a + b, 0) / priceData.length;
      const maxPrice = Math.max(...priceData);
      const minPrice = Math.min(...priceData);

      const prompt = `
You are a silver market expert. Analyze the following silver price data for the ${period} period:
- Average Price: $${avgPrice.toFixed(2)}/oz
- Highest Price: $${maxPrice.toFixed(2)}/oz
- Lowest Price: $${minPrice.toFixed(2)}/oz

Provide:
1. Market trend assessment (bullish/bearish/neutral)
2. Key price drivers
3. Trading recommendation
4. Risk assessment

Keep the response concise and actionable for traders.`;

      const response = await model.generateContent(prompt);
      const text = response.response.text();

      // Store in database
      await prisma.trendAnalysis.create({
        data: {
          period,
          trendDirection: extractTrend(text),
          averagePrice: avgPrice,
          highPrice: maxPrice,
          lowPrice: minPrice,
          analysis: text,
        },
      });

      return text;
    });
  } catch (error) {
    if (error instanceof CircuitBreakerOpenError) {
      console.warn('[AI Agent] Gemini API circuit breaker open, using fallback');
    } else {
      console.error('[AI Agent] Error analyzing trends:', error);
    }

    // Graceful degradation: fall back to mock data
    return getMockSilverAdvice(period);
  }
}

/**
 * Generate Silver Trading Advice
 * @param userQuery - User's question about silver trading
 * @returns Promise<string> - AI-generated advice
 */
export async function generateSilverAdvice(userQuery: string): Promise<string> {
  const flags = getFeatureFlagsManager();
  const aiEnabled = await flags.isEnabled('FEATURE_AI_ADVISOR');

  if (!aiEnabled) {
    return getMockSilverAdvice('general');
  }

  try {
    return await geminiBreaker.execute(async () => {
      if (!genAI) {
        throw new Error('Gemini not initialized');
      }

      const model = getModel();
      const prompt = `
You are a knowledgeable silver trading advisor. Answer the following question about silver:

Question: ${userQuery}

Provide practical, accurate advice based on current market knowledge. Keep the response clear and concise.`;

      const response = await model.generateContent(prompt);
      const text = response.response.text();

      return text;
    });
  } catch (error) {
    if (error instanceof CircuitBreakerOpenError) {
      console.warn('[AI Agent] Gemini API circuit breaker open, using fallback');
    } else {
      console.error('[AI Agent] Error generating advice:', error);
    }

    return getMockSilverAdvice('general');
  }
}

/**
 * Extract trend direction from AI response
 */
function extractTrend(text: string): string {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('bullish') || lowerText.includes('upward')) return 'UP';
  if (lowerText.includes('bearish') || lowerText.includes('downward')) return 'DOWN';
  return 'STABLE';
}

/**
 * Get AI Advisor Status
 */
export function getAIStatus() {
  const { state, metrics } = geminiBreaker.getStatus();
  return {
    service: 'Gemini AI',
    circuitBreaker: { state, metrics },
    available: state !== 'OPEN',
  };
}
