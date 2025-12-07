import { api, APIError } from 'encore.dev/api';
import { SQLDatabase } from 'encore.dev/storage/sqldb';
import * as path from 'path';
import type { Product, ProductsResponse } from './types';

// Database connection
const db = new SQLDatabase('product', {
  migrations: path.join(__dirname, 'migrations'),
});

/**
 * Get Single Product by ID
 */
export const getProductById = api(
  { expose: true, method: 'GET', path: '/products/:id' },
  async ({ id }: { id: string }): Promise<Product> => {
    const result = await db.query('SELECT * FROM products WHERE id = $1', [
      id,
    ]);

    if (result.rows.length === 0) {
      throw APIError.notFound('Product not found');
    }

    return mapRowToProduct(result.rows[0]);
  }
);

/**
 * Get Featured Products
 */
export const getFeaturedProducts = api(
  { expose: true, method: 'GET', path: '/products/featured' },
  async ({ limit = 8 }: { limit?: number }): Promise<ProductsResponse> => {
    const result = await db.query(
      'SELECT * FROM products WHERE is_featured = true ORDER BY created_at DESC LIMIT $1',
      [limit]
    );

    const products = result.rows.map(mapRowToProduct);

    return {
      products,
      count: products.length,
    };
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
    // Get product category
    const productResult = await db.query(
      'SELECT category FROM products WHERE id = $1',
      [id]
    );

    if (productResult.rows.length === 0) {
      throw APIError.notFound('Product not found');
    }

    const category = productResult.rows[0].category;

    // Get related products (same category, excluding current)
    const result = await db.query(
      `SELECT * FROM products 
       WHERE category = $1 AND id != $2 AND in_stock = true
       ORDER BY rating DESC, review_count DESC
       LIMIT $3`,
      [category, id, limit]
    );

    const products = result.rows.map(mapRowToProduct);

    return {
      products,
      count: products.length,
    };
  }
);

/**
 * Search Products
 */
export const searchProducts = api(
  { expose: true, method: 'GET', path: '/products/search' },
  async ({ query }: { query: string }): Promise<ProductsResponse> => {
    const result = await db.query(
      `SELECT * FROM products 
       WHERE name ILIKE $1 OR description ILIKE $1 OR serial_number ILIKE $1
       ORDER BY rating DESC
       LIMIT 20`,
      [`%${query}%`]
    );

    const products = result.rows.map(mapRowToProduct);

    return {
      products,
      count: products.length,
    };
  }
);

/**
 * Get Product Categories
 */
export const getProductCategories = api(
  { expose: true, method: 'GET', path: '/products/categories/list' },
  async (): Promise<{ categories: Array<{ name: string; count: number }>; total: number }> => {
    const result = await db.query(
      `SELECT category as name, COUNT(*) as count 
       FROM products 
       GROUP BY category 
       ORDER BY count DESC`
    );

    const categories = result.rows.map((row: any) => ({
      name: row.name,
      count: parseInt(row.count),
    }));

    return {
      categories,
      total: categories.length,
    };
  }
);

// Helper function to map database row to Product
function mapRowToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    nameEn: row.name_en,
    description: row.description,
    price: parseFloat(row.price),
    originalPrice: row.original_price
      ? parseFloat(row.original_price)
      : undefined,
    weight: parseFloat(row.weight),
    purity: row.purity,
    serialNumber: row.serial_number,
    category: row.category,
    images:
      typeof row.images === 'string' ? JSON.parse(row.images) : row.images,
    inStock: row.in_stock,
    isNew: row.is_new,
    isFeatured: row.is_featured,
    discount: row.discount,
    rating: row.rating ? parseFloat(row.rating) : undefined,
    reviewCount: row.review_count,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
