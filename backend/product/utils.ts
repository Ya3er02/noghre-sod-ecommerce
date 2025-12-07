/**
 * Shared Utilities for Product Module
 * Centralized helper functions to avoid duplication
 */

import type { Product } from './types';

/**
 * Safely parse JSON string to array
 * Returns empty array on parse failure or non-array result
 */
export function parseImages(images: any): string[] {
  if (Array.isArray(images)) {
    return images;
  }
  
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  
  return [];
}

/**
 * Safely parse numeric value
 * Returns undefined if value is invalid or NaN
 */
export function safeParseFloat(value: any): number | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  
  const num = parseFloat(value);
  return isNaN(num) ? undefined : num;
}

/**
 * Safely parse date value
 * Returns undefined if date is invalid
 */
export function safeParseDate(value: any): Date | undefined {
  if (!value) {
    return undefined;
  }
  
  const date = new Date(value);
  return isNaN(date.getTime()) ? undefined : date;
}

/**
 * Map database row to Product object
 * Safely handles type coercion and null values
 */
export function mapRowToProduct(row: any): Product {
  if (!row) {
    throw new Error('Cannot map null or undefined row to Product');
  }
  
  return {
    id: row.id || '',
    name: row.name || '',
    nameEn: row.name_en || undefined,
    description: row.description || '',
    price: safeParseFloat(row.price) || 0,
    originalPrice: safeParseFloat(row.original_price),
    weight: safeParseFloat(row.weight) || 0,
    purity: (row.purity || '925') as '925' | '999',
    serialNumber: row.serial_number || '',
    category: row.category || '',
    images: parseImages(row.images),
    inStock: row.in_stock === true,
    isNew: row.is_new === true,
    isFeatured: row.is_featured === true,
    discount: safeParseFloat(row.discount),
    rating: safeParseFloat(row.rating),
    reviewCount: safeParseFloat(row.review_count),
    createdAt: safeParseDate(row.created_at) || new Date(),
    updatedAt: safeParseDate(row.updated_at) || new Date(),
  };
}
