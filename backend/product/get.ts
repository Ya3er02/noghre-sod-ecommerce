import { api, APIError } from 'encore.dev/api';
import { db } from './db';
import { mapRowToProduct } from './utils';
import type { Product, ProductsResponse } from './types';

const MAX_LIMIT = 100;

/**
 * Get Single Product by ID
 */
export const getProductById = api(
  { expose: true, method: 'GET', path: '/products/:id' },
  async ({ id }: { id: string }): Promise<Product> => {
    if (!id || typeof id !== 'string') {
      throw APIError.invalidArgument('Product ID is required');
    }

    try {
      const result = await db.query('SELECT * FROM products WHERE id = $1', [
        id,
      ]);

      if (!result?.rows?.[0]) {
        throw APIError.notFound('Product not found');
      }

      return mapRowToProduct(result.rows[0]);
    } catch (error) {
      if (error instanceof Error && error.message?.includes('not found')) {
        throw error;
      }
      console.error('Error getting product:', error);
      throw APIError.internal('Failed to get product');
    }
  }
);

/**
 * Get Featured Products
 */
export const getFeaturedProducts = api(
  { expose: true, method: 'GET', path: '/products/featured' },
  async ({ limit = 8 }: { limit?: number }): Promise<ProductsResponse> => {
    // Validate limit
    const validatedLimit = Math.min(
      MAX_LIMIT,
      Math.max(1, Math.floor(limit || 8))
    );

    try {
      const result = await db.query(
        'SELECT * FROM products WHERE is_featured = true ORDER BY created_at DESC LIMIT $1',
        [validatedLimit]
      );

      const products = (result.rows || []).map(mapRowToProduct);

      return {
        products,
        count: products.length,
      };
    } catch (error) {
      console.error('Error getting featured products:', error);
      throw APIError.internal('Failed to get featured products');
    }
  }
);

/**
 * Get Related Products (Cross-sell)
 */
export const getRelatedProducts = api(
  { expose: true, method: 'GET', path: '/products/:id/related' },
  async ({
    id,
    limit = 4,
  }: {
    id: string;
    limit?: number;
  }): Promise<ProductsResponse> => {
    if (!id || typeof id !== 'string') {
      throw APIError.invalidArgument('Product ID is required');
    }

    // Validate limit
    const validatedLimit = Math.min(
      MAX_LIMIT,
      Math.max(1, Math.floor(limit || 4))
    );

    try {
      // Get product category
      const productResult = await db.query(
        'SELECT category FROM products WHERE id = $1',
        [id]
      );

      if (!productResult?.rows?.[0]) {
        throw APIError.notFound('Product not found');
      }

      const category = productResult.rows[0].category;

      // Get related products (same category, excluding current)
      const result = await db.query(
        `SELECT * FROM products 
         WHERE category = $1 AND id != $2 AND in_stock = true
         ORDER BY rating DESC, review_count DESC
         LIMIT $3`,
        [category, id, validatedLimit]
      );

      const products = (result.rows || []).map(mapRowToProduct);

      return {
        products,
        count: products.length,
      };
    } catch (error) {
      if (error instanceof Error && error.message?.includes('not found')) {
        throw error;
      }
      console.error('Error getting related products:', error);
      throw APIError.internal('Failed to get related products');
    }
  }
);

/**
 * Search Products
 */
export const searchProducts = api(
  { expose: true, method: 'GET', path: '/products/search' },
  async ({ query }: { query: string }): Promise<ProductsResponse> => {
    if (!query || typeof query !== 'string') {
      throw APIError.invalidArgument('Search query is required');
    }

    try {
      const result = await db.query(
        `SELECT * FROM products 
         WHERE name ILIKE $1 OR description ILIKE $1 OR serial_number ILIKE $1
         ORDER BY rating DESC
         LIMIT 20`,
        [`%${query}%`]
      );

      const products = (result.rows || []).map(mapRowToProduct);

      return {
        products,
        count: products.length,
      };
    } catch (error) {
      console.error('Error searching products:', error);
      throw APIError.internal('Failed to search products');
    }
  }
);

/**
 * Get Product Categories
 */
export const getProductCategories = api(
  { expose: true, method: 'GET', path: '/products/categories/list' },
  async (): Promise<{
    categories: Array<{ name: string; count: number }>;
    total: number;
  }> => {
    try {
      const result = await db.query(
        `SELECT category as name, COUNT(*) as count 
         FROM products 
         GROUP BY category 
         ORDER BY count DESC`
      );

      const categories = (result.rows || []).map((row: any) => ({
        name: row.name || '',
        count: parseInt(row.count || '0'),
      }));

      return {
        categories,
        total: categories.length,
      };
    } catch (error) {
      console.error('Error getting categories:', error);
      throw APIError.internal('Failed to get categories');
    }
  }
);
