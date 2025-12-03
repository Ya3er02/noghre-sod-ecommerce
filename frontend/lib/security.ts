import DOMPurify from 'dompurify';
import { z } from 'zod';

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHTML(dirty: string): string {
  // Configure sanitizer with security best practices
  const config = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_UNKNOWN_PROTOCOLS: false, // Prevent unknown protocols
  };

  // Add hook to enforce rel="noopener noreferrer" on target="_blank" links
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
      const anchor = node as HTMLAnchorElement;
      if (anchor.getAttribute('target') === '_blank') {
        anchor.setAttribute('rel', 'noopener noreferrer');
      }
    }
  });

  const sanitized = DOMPurify.sanitize(dirty, config);

  // Remove hook to avoid global side effects
  DOMPurify.removeHook('afterSanitizeAttributes');

  return sanitized;
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
  
  // Add leading 0 if missing (normalize "9..." to "09...")
  const normalized = cleaned.startsWith('9') ? `0${cleaned}` : cleaned;
  
  // Validate Iranian phone number format - require normalized "09" prefix
  const phoneSchema = z.string().regex(
    /^09\d{9}$/,
    'شماره تلفن باید ۱۱ رقم و با ۰۹ شروع شود'
  );
  
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
 * Rate limiting helper (client-side) with periodic cleanup
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 60000 // 1 minute
  ) {
    // Start periodic cleanup to prevent memory leak
    this.startCleanup();
  }
  
  private startCleanup(): void {
    // Run cleanup every half window period
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const staleKeys: string[] = [];
      
      // Find stale entries
      this.attempts.forEach((timestamps, identifier) => {
        const recentAttempts = timestamps.filter(time => now - time < this.windowMs);
        if (recentAttempts.length === 0) {
          staleKeys.push(identifier);
        } else if (recentAttempts.length < timestamps.length) {
          // Update with only recent attempts
          this.attempts.set(identifier, recentAttempts);
        }
      });
      
      // Remove stale entries
      staleKeys.forEach(key => this.attempts.delete(key));
    }, this.windowMs / 2);
  }
  
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
  
  /**
   * Stop periodic cleanup and clear all data
   */
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.attempts.clear();
  }
}

// Export singleton rate limiter instance
export const rateLimiter = new RateLimiter();
