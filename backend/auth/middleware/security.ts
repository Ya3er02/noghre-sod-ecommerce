import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

/**
 * Rate Limiting برای جلوگیری از حملات DDoS و Brute Force
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقیقه
  max: 100, // حداکثر 100 درخواست در هر window
  message: {
    error: 'تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً بعداً تلاش کنید.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

/**
 * Rate Limiting شدید برای Login endpoint
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقیقه
  max: 5, // فقط 5 تلاش login
  skipSuccessfulRequests: true, // تلاش‌های موفق را نادیده بگیر
  message: {
    error: 'تعداد تلاش‌های ورود شما بیش از حد مجاز است. لطفاً 15 دقیقه صبر کنید.',
    retryAfter: '15 minutes'
  },
});

/**
 * Rate Limiting برای OTP و تایید شماره موبایل
 */
export const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 ساعت
  max: 3, // فقط 3 درخواست OTP در ساعت
  message: {
    error: 'تعداد درخواست‌های OTP شما بیش از حد مجاز است.',
    retryAfter: '1 hour'
  },
});

/**
 * Helmet برای امنیت HTTP Headers
 */
export const securityHeaders = helmet({
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
    maxAge: 31536000, // 1 سال
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny', // جلوگیری از Clickjacking
  },
  noSniff: true, // جلوگیری از MIME type sniffing
  xssFilter: true, // فعال‌سازی XSS filter مرورگر
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
});

/**
 * IP Whitelist Middleware
 * برای محدود کردن دسترسی به Admin Panel
 */
export const ipWhitelist = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.socket.remoteAddress;
    
    if (!clientIP || !allowedIPs.includes(clientIP)) {
      return res.status(403).json({
        error: 'دسترسی از این IP مجاز نیست',
        code: 'IP_NOT_WHITELISTED'
      });
    }
    
    next();
  };
};

/**
 * Request Sanitization
 * پاکسازی input های کاربر برای جلوگیری از حملات
 */
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
  // پاکسازی query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeInput(req.query[key] as string);
      }
    });
  }
  
  // پاکسازی body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  next();
};

function sanitizeInput(input: string): string {
  // حذف HTML tags
  return input.replace(/<[^>]*>/g, '')
    // حذف کاراکترهای خطرناک
    .replace(/[<>"']/g, '')
    .trim();
}

function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const sanitized: any = {};
    Object.keys(obj).forEach(key => {
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
    
    // در محیط development همه originها مجاز هستند
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
      return;
    }
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('دسترسی از این دامنه مجاز نیست'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
