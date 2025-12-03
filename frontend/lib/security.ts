import DOMPurify from 'dompurify';
import { z } from 'zod';

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
}

/**
 * Sanitize plain text (remove all HTML)
 */
export function sanitizeText(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string {
  const emailSchema = z.string().email();
  try {
    return emailSchema.parse(email.trim().toLowerCase());
  } catch {
    throw new Error('Invalid email format');
  }
}

/**
 * Validate and sanitize phone number (Persian format)
 */
export function sanitizePhone(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Validate Iranian phone number format
  const phoneSchema = z.string().regex(
    /^(09|9)\d{9}$/,
    'شماره تلفن باید ۱۱ رقم و با ۰۹ شروع شود'
  );
  
  // Add leading 0 if missing
  const normalized = cleaned.startsWith('9') ? `0${cleaned}` : cleaned;
  
  return phoneSchema.parse(normalized);
}

/**
 * Validate and sanitize numeric input
 */
export function sanitizeNumber(value: string | number, options?: {
  min?: number;
  max?: number;
  integer?: boolean;
}): number {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    throw new Error('Invalid number');
  }
  
  if (options?.integer && !Number.isInteger(num)) {
    throw new Error('Must be an integer');
  }
  
  if (options?.min !== undefined && num < options.min) {
    throw new Error(`Must be at least ${options.min}`);
  }
  
  if (options?.max !== undefined && num > options.max) {
    throw new Error(`Must be at most ${options.max}`);
  }
  
  return num;
}

/**
 * Validate and sanitize URL
 */
export function sanitizeURL(url: string, allowedProtocols: string[] = ['http', 'https']): string {
  try {
    const parsed = new URL(url);
    
    if (!allowedProtocols.includes(parsed.protocol.replace(':', ''))) {
      throw new Error('Invalid URL protocol');
    }
    
    return parsed.toString();
  } catch {
    throw new Error('Invalid URL format');
  }
}

/**
 * Validate serial number format (for product tracking)
 */
export function validateSerialNumber(serial: string): boolean {
  // Example: NS-2024-123456 (Noghre Sood - Year - Unique ID)
  const serialPattern = /^NS-\d{4}-\d{6}$/;
  return serialPattern.test(serial);
}

/**
 * Sanitize search query to prevent injection attacks
 */
export function sanitizeSearchQuery(query: string): string {
  // Remove special characters that could be used in SQL injection
  const cleaned = query
    .replace(/[;'"\\]/g, '') // Remove SQL special characters
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .trim();
  
  // Limit length
  return cleaned.substring(0, 200);
}

/**
 * Rate limiting helper (client-side)
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 60000 // 1 minute
  ) {}
  
  check(identifier: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    
    // Remove old attempts outside window
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false; // Rate limit exceeded
    }
    
    // Add current attempt
    recentAttempts.push(now);
    this.attempts.set(identifier, recentAttempts);
    
    return true; // Allow
  }
  
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

// Export singleton rate limiter instance
export const rateLimiter = new RateLimiter();
