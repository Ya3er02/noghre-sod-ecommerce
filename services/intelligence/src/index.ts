/**
 * Intelligence Service - AI-Powered Insights
 * Provides: Silver Trend Analysis, Market Advice, AI Recommendations
 * Integrates: Google Gemini 1.5 Flash (Free Tier)
 * Port: 3002
 * 
 * Designed to gracefully degrade - if Gemini fails, falls back to mock data
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '@repo/database';
import { getFeatureFlagsManager } from '@repo/utils/feature-flags';
import { createCircuitBreaker } from '@repo/utils/circuit-breaker';
import { analyzeSilverTrends, generateSilverAdvice, getAIStatus } from './ai-agent';
import { getMockSilverAdvice, isUsingFallback, simulateAIDelay } from './fallback';

const app: Express = express();
const PORT = process.env.PORT || 3002;

// ============================================
// MIDDLEWARE
// ============================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

/**
 * Request logging middleware
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
    );
  });
  next();
});

/**
 * Error handling middleware
 */
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// TYPES & VALIDATION
// ============================================

const TrendAnalysisSchema = z.object({
  period: z.enum(['1H', '1D', '7D', '30D', '1Y']),
  priceData: z.array(z.number()).min(1),
});

const AdviceSchema = z.object({
  query: z.string().min(5).max(500),
});

type TrendAnalysisPayload = z.infer<typeof TrendAnalysisSchema>;
type AdvicePayload = z.infer<typeof AdviceSchema>;

// ============================================
// ROUTES
// ============================================

/**
 * Health Check
 */
app.get('/health', async (req: Request, res: Response) => {
  const aiStatus = getAIStatus();
  const flags = await getFeatureFlagsManager().getAllFlags();
  const usingFallback = isUsingFallback();

  res.status(200).json({
    status: aiStatus.available ? 'healthy' : 'degraded',
    service: 'Intelligence Service',
    ai: aiStatus,
    features: flags,
    fallbackMode: usingFallback,
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /analyze - Analyze Silver Trends
 * Body: { period: "1D", priceData: [31.5, 32.0, 31.8, ...] }
 */
app.post('/analyze', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = TrendAnalysisSchema.parse(req.body);

    // Simulate AI processing time
    await simulateAIDelay(300, 800);

    const analysis = await analyzeSilverTrends(payload.period, payload.priceData);

    res.json({
      period: payload.period,
      analysis,
      fallbackUsed: isUsingFallback(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
    } else {
      next(error);
    }
  }
});

/**
 * POST /advice - Get Silver Trading Advice
 * Body: { query: "Should I buy silver now?" }
 */
app.post('/advice', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = AdviceSchema.parse(req.body);

    // Simulate AI processing time
    await simulateAIDelay(400, 900);

    const advice = await generateSilverAdvice(payload.query);

    // Store interaction in database
    await prisma.aIAdvisor.create({
      data: {
        sessionId: req.headers['x-session-id'] as string || `session-${Date.now()}`,
        query: payload.query,
        response: advice,
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
        fallbackUsed: isUsingFallback(),
      },
    });

    res.json({
      query: payload.query,
      advice,
      fallbackUsed: isUsingFallback(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
    } else {
      next(error);
    }
  }
});

/**
 * GET /history - Get AI Interaction History
 */
app.get('/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const sessionId = req.query.sessionId as string;

    const interactions = await prisma.aIAdvisor.findMany({
      where: sessionId ? { sessionId } : {},
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      total: interactions.length,
      data: interactions,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /trends - Get Trend Analysis History
 */
app.get('/trends', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const period = req.query.period as string | undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

    const trends = await prisma.trendAnalysis.findMany({
      where: period ? { period } : {},
      take: limit,
      orderBy: { generatedAt: 'desc' },
    });

    res.json({
      total: trends.length,
      data: trends,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /status - Get AI Service Status
 */
app.get('/status', async (req: Request, res: Response) => {
  const aiStatus = getAIStatus();
  const flags = await getFeatureFlagsManager().getAllFlags();

  res.json({
    service: 'Intelligence Service',
    status: aiStatus.available ? 'operational' : 'degraded',
    ai: aiStatus,
    features: flags,
    fallbackEnabled: isUsingFallback(),
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// START SERVER
// ============================================

const server = app.listen(PORT, () => {
  console.log(`[Intelligence Service] Running on http://localhost:${PORT}`);
  console.log(`[Intelligence Service] Fallback mode: ${isUsingFallback()}`);
  console.log(`[Intelligence Service] Health check: GET /health`);
});

/**
 * Graceful shutdown
 */
process.on('SIGTERM', async () => {
  console.log('[Intelligence Service] SIGTERM received, shutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});

export default app;
