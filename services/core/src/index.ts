/**
 * Core Service - Essential API
 * Handles: Authentication, User Management, Product Catalog (Read-Only)
 * Port: 3001
 * 
 * This service MUST NEVER go down - implements graceful degradation
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { isDatabaseHealthy, prisma } from '@repo/database';
import { getFeatureFlagsManager } from '@repo/utils/feature-flags';
import { createCircuitBreaker } from '@repo/utils/circuit-breaker';

const app: Express = express();
const PORT = process.env.PORT || 3001;

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
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
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

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

type RegisterPayload = z.infer<typeof RegisterSchema>;
type LoginPayload = z.infer<typeof LoginSchema>;

// ============================================
// AUTHENTICATION
// ============================================

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-min-32-chars-required';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

/**
 * Generate JWT token
 */
function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Verify JWT token and extract userId
 */
function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Auth middleware
 */
function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: 'Missing or invalid token' });
    return;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  (req as any).userId = decoded.userId;
  next();
}

// ============================================
// ROUTES
// ============================================

/**
 * Health Check - ALWAYS AVAILABLE
 */
app.get('/health', async (req: Request, res: Response) => {
  const dbHealth = await isDatabaseHealthy();
  const flags = await getFeatureFlagsManager().getAllFlags();

  res.status(dbHealth ? 200 : 503).json({
    status: dbHealth ? 'healthy' : 'degraded',
    database: dbHealth,
    features: flags,
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /auth/register - User Registration
 */
app.post('/auth/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = RegisterSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (existingUser) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        passwordHash: payload.password, // TODO: Hash password with bcrypt in production
      },
    });

    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      token,
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
 * POST /auth/login - User Login
 */
app.post('/auth/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = LoginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // TODO: Verify password hash with bcrypt
    if (user.passwordHash !== payload.password) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      token,
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
 * GET /auth/me - Get Current User
 */
app.get('/auth/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /products - List All Products (Cached, Read-Only)
 */
app.get('/products', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        take: limit,
        skip: offset,
        include: { prices: { take: 1, orderBy: { timestamp: 'desc' } } },
      }),
      prisma.product.count({ where: { isActive: true } }),
    ]);

    res.json({
      data: products,
      pagination: { limit, offset, total },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /products/:id - Get Single Product
 */
app.get('/products/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { prices: { take: 5, orderBy: { timestamp: 'desc' } } },
    });

    if (!product || !product.isActive) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json({ data: product });
  } catch (error) {
    next(error);
  }
});

// ============================================
// START SERVER
// ============================================

const server = app.listen(PORT, () => {
  console.log(`[Core Service] Running on http://localhost:${PORT}`);
  console.log(`[Core Service] Health check: GET /health`);
});

/**
 * Graceful shutdown
 */
process.on('SIGTERM', async () => {
  console.log('[Core Service] SIGTERM received, shutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});

export default app;
