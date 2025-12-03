import { describe, it, expect } from 'bun:test';
import {
  sanitizeHTML,
  sanitizeText,
  sanitizeEmail,
  sanitizePhone,
  sanitizeNumber,
  validateSerialNumber,
  sanitizeSearchQuery,
} from '@/lib/security';

describe('Security Utilities', () => {
  describe('sanitizeHTML', () => {
    it('should allow safe HTML tags', () => {
      const input = '<p>Hello <strong>World</strong></p>';
      const output = sanitizeHTML(input);
      expect(output).toContain('<strong>');
      expect(output).toContain('Hello');
    });

    it('should remove script tags', () => {
      const input = '<p>Hello</p><script>alert("XSS")</script>';
      const output = sanitizeHTML(input);
      expect(output).not.toContain('<script>');
      expect(output).not.toContain('alert');
    });

    it('should remove dangerous attributes', () => {
      const input = '<a href="javascript:alert(1)">Click</a>';
      const output = sanitizeHTML(input);
      expect(output).not.toContain('javascript:');
    });

    it('should remove onclick handlers', () => {
      const input = '<div onclick="alert(1)">Click</div>';
      const output = sanitizeHTML(input);
      expect(output).not.toContain('onclick');
    });
  });

  describe('sanitizeText', () => {
    it('should remove all HTML tags', () => {
      const input = '<p>Hello <strong>World</strong></p>';
      const output = sanitizeText(input);
      expect(output).toBe('Hello World');
    });

    it('should handle empty strings', () => {
      expect(sanitizeText('')).toBe('');
    });
  });

  describe('sanitizeEmail', () => {
    it('should accept valid email', () => {
      expect(sanitizeEmail('test@example.com')).toBe('test@example.com');
    });

    it('should lowercase email', () => {
      expect(sanitizeEmail('TEST@EXAMPLE.COM')).toBe('test@example.com');
    });

    it('should trim whitespace', () => {
      expect(sanitizeEmail('  test@example.com  ')).toBe('test@example.com');
    });

    it('should throw on invalid email', () => {
      expect(() => sanitizeEmail('invalid-email')).toThrow('Invalid email format');
      expect(() => sanitizeEmail('test@')).toThrow();
      expect(() => sanitizeEmail('@example.com')).toThrow();
    });
  });

  describe('sanitizePhone', () => {
    it('should accept valid Iranian phone', () => {
      expect(sanitizePhone('09123456789')).toBe('09123456789');
    });

    it('should add leading zero', () => {
      expect(sanitizePhone('9123456789')).toBe('09123456789');
    });

    it('should remove formatting characters', () => {
      expect(sanitizePhone('0912-345-6789')).toBe('09123456789');
      expect(sanitizePhone('0912 345 6789')).toBe('09123456789');
      expect(sanitizePhone('(0912) 345-6789')).toBe('09123456789');
    });

    it('should throw on invalid format', () => {
      expect(() => sanitizePhone('123456')).toThrow();
      expect(() => sanitizePhone('0812345678')).toThrow(); // Wrong prefix
      expect(() => sanitizePhone('091234567890')).toThrow(); // Too long
    });
  });

  describe('sanitizeNumber', () => {
    it('should accept valid numbers', () => {
      expect(sanitizeNumber(42)).toBe(42);
      expect(sanitizeNumber('42')).toBe(42);
      expect(sanitizeNumber(3.14)).toBe(3.14);
    });

    it('should enforce integer constraint', () => {
      expect(sanitizeNumber(42, { integer: true })).toBe(42);
      expect(() => sanitizeNumber(3.14, { integer: true })).toThrow('Must be an integer');
    });

    it('should enforce min/max constraints', () => {
      expect(sanitizeNumber(50, { min: 0, max: 100 })).toBe(50);
      expect(() => sanitizeNumber(-10, { min: 0 })).toThrow('Must be at least 0');
      expect(() => sanitizeNumber(150, { max: 100 })).toThrow('Must be at most 100');
    });

    it('should throw on invalid number', () => {
      expect(() => sanitizeNumber('not-a-number')).toThrow('Invalid number');
      expect(() => sanitizeNumber('abc123')).toThrow();
    });
  });

  describe('validateSerialNumber', () => {
    it('should accept valid format', () => {
      expect(validateSerialNumber('NS-2024-123456')).toBe(true);
      expect(validateSerialNumber('NS-2023-999999')).toBe(true);
    });

    it('should reject invalid format', () => {
      expect(validateSerialNumber('INVALID')).toBe(false);
      expect(validateSerialNumber('NS-24-123456')).toBe(false); // Wrong year format
      expect(validateSerialNumber('NS-2024-12345')).toBe(false); // Too short
      expect(validateSerialNumber('NS-2024-1234567')).toBe(false); // Too long
      expect(validateSerialNumber('XX-2024-123456')).toBe(false); // Wrong prefix
    });
  });

  describe('sanitizeSearchQuery', () => {
    it('should allow normal text', () => {
      expect(sanitizeSearchQuery('نقره')).toBe('نقره');
      expect(sanitizeSearchQuery('silver jewelry')).toBe('silver jewelry');
    });

    it('should remove SQL injection characters', () => {
      expect(sanitizeSearchQuery("test'; DROP TABLE users--")).not.toContain("'");
      expect(sanitizeSearchQuery('test" OR 1=1--')).not.toContain('"');
    });

    it('should remove script tags', () => {
      const input = '<script>alert("XSS")</script>test';
      const output = sanitizeSearchQuery(input);
      expect(output).not.toContain('<script>');
    });

    it('should limit length to 200 characters', () => {
      const longQuery = 'a'.repeat(300);
      expect(sanitizeSearchQuery(longQuery).length).toBe(200);
    });

    it('should trim whitespace', () => {
      expect(sanitizeSearchQuery('  test  ')).toBe('test');
    });
  });
});
