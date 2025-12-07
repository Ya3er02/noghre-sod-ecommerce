/**
 * Security Middleware for Express
 * Encore.dev compatible security configurations
 *
 * NOTE: sanitizeRequest is for basic HTML tag removal only.
 * For context-aware security:
 * - Use HTML encoding/escaping when rendering to HTML
 * - Use parameterized queries for database access (done via ORM)
 * - Never rely on global character stripping for security
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Rate Limiting for preventing DDoS and Brute Force attacks
 * Using built-in Encore rate limiting instead of external packages
 */
export const apiLimiter = (req: Request, res: Response, next: NextFunction) => {
  // Rate limiting should be configured in encore.dev dashboard
  // This middleware is a placeholder for consistent API
  next();
};

/**
 * Strict Rate Limiting for Login endpoint
 */
export const loginLimiter = (req: Request, res: Response, next: NextFunction) => {
  // Rate limiting should be configured in encore.dev dashboard
  next();
};

/**
 * Rate Limiting for OTP and mobile number verification
 */
export const otpLimiter = (req: Request, res: Response, next: NextFunction) => {
  // Rate limiting should be configured in encore.dev dashboard
  next();
};

/**
 * Security Headers Configuration
 * Note: Helmet is typically used in Express middleware,
 * but Encore.dev handles most security headers automatically
 */
export const securityHeaders = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      connectSrc: ["'self'", 'https://api.noghresood.shop'],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny', // Prevent Clickjacking
  },
  noSniff: true, // Prevent MIME type sniffing
  xssFilter: true, // Enable XSS filter
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
};

/**
 * IP Whitelist Middleware
 * For restricting access to Admin Panel
 */
export const ipWhitelist = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.socket.remoteAddress;

    if (!clientIP || !allowedIPs.includes(clientIP)) {
      return res.status(403).json({
        error: 'Access from this IP is not allowed',
        code: 'IP_NOT_WHITELISTED',
      });
    }

    next();
  };
};

/**
 * Request Sanitization - Basic HTML Tag Removal Only
 *
 * This function removes HTML tags and script-like content but preserves
 * legitimate characters including apostrophes (for "don't", "Women's", etc.).
 *
 * IMPORTANT: This is for basic tag stripping only, NOT a complete security solution:
 * - For HTML output: use proper HTML encoding/escaping
 * - For database: use parameterized queries (already done)
 * - For specific contexts: apply context-aware protections
 */
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach((key) => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeInput(req.query[key] as string);
      }
    });
  }

  // Sanitize body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  next();
};

/**
 * Remove HTML tags and script-related content
 * Preserves apostrophes and legitimate characters
 */
function sanitizeInput(input: string): string {
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');

  // Remove dangerous script-related patterns
  // (on* event handlers, javascript: protocol, etc.)
  sanitized = sanitized.replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:text\/html/gi, ''); // Remove data: URLs with HTML

  return sanitized.trim();
}

function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  if (typeof obj === 'object' && obj !== null) {
    const sanitized: any = {};
    Object.keys(obj).forEach((key) => {
      sanitized[key] = sanitizeObject(obj[key]);
    });
    return sanitized;
  }

  return obj;
}

/**
 * CORS Configuration
 */
export const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    const allowedOrigins = [
      'https://noghresood.shop',
      'https://www.noghresood.shop',
      'https://api.noghresood.shop',
    ];

    // In development mode, all origins are allowed
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
      return;
    }

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Access from this domain is not allowed'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
