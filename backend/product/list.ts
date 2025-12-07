import { api, APIError } from 'encore.dev/api';
import { db } from './db';
import { mapRowToProduct } from './utils';
import type {
  Product,
  ProductFilterParams,
  ProductListResponse,
} from './types';

/**
 * List Products with Filtering & Pagination
 * Implements luxury e-commerce best practices
 */
export const listProducts = api(
  { expose: true, method: 'GET', path: '/products' },
  async (params: ProductFilterParams): Promise<ProductListResponse> => {
    const {
      categories,
      purities,
      minPrice,
      maxPrice,
      minWeight,
      maxWeight,
      inStock,
      onSale,
      sortBy = 'newest',
      page = 1,
      limit = 12,
    } = params;

    // Validate pagination
    const validatedPage = Math.max(1, Math.floor(page || 1));
    const validatedLimit = Math.min(100, Math.max(1, Math.floor(limit || 12)));
    const offset = (validatedPage - 1) * validatedLimit;

    // Build WHERE clause
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (categories) {
      const categoriesArray = categories.split(',').map((c) => c.trim());
      conditions.push(`category = ANY($${paramIndex})`);
      values.push(categoriesArray);
      paramIndex++;
    }

    if (purities) {
      const puritiesArray = purities.split(',').map((p) => p.trim());
      conditions.push(`purity = ANY($${paramIndex})`);
      values.push(puritiesArray);
      paramIndex++;
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
      conditions.push(`price BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
      values.push(minPrice, maxPrice);
      paramIndex += 2;
    }

    if (minWeight !== undefined && maxWeight !== undefined) {
      conditions.push(
        `weight BETWEEN $${paramIndex} AND $${paramIndex + 1}`
      );
      values.push(minWeight, maxWeight);
      paramIndex += 2;
    }

    if (inStock === true) {
      conditions.push(`in_stock = true`);
    }

    if (onSale === true) {
      conditions.push(`discount > 0`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Build ORDER BY clause
    let orderBy = 'created_at DESC';
    switch (sortBy) {
      case 'price-asc':
        orderBy = 'price ASC';
        break;
      case 'price-desc':
        orderBy = 'price DESC';
        break;
      case 'popular':
        orderBy = 'review_count DESC, rating DESC';
        break;
      case 'weight':
        orderBy = 'weight DESC';
        break;
    }

    try {
      // Get total count
      const countQuery = `SELECT COUNT(*) FROM products ${whereClause}`;
      const countResult = await db.query(countQuery, values);
      const totalCount = countResult.rows?.[0]
        ? parseInt(countResult.rows[0].count)
        : 0;

      // Get products
      const query = `
        SELECT * FROM products
        ${whereClause}
        ORDER BY ${orderBy}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      values.push(validatedLimit, offset);

      const result = await db.query(query, values);
      const products = (result.rows || []).map(mapRowToProduct);

      return {
        products,
        totalCount,
        totalPages: Math.ceil(totalCount / validatedLimit),
        currentPage: validatedPage,
      };
    } catch (error) {
      console.error('Error listing products:', error);
      throw APIError.internal('Failed to list products');
    }
  }
);
