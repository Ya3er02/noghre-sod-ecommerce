import { api, APIError } from 'encore.dev/api';
import { SQLDatabase } from 'encore.dev/storage/sqldb';
import * as path from 'path';
import type {
  Product,
  ProductFilterParams,
  ProductListResponse,
} from './types';

// Database connection
const db = new SQLDatabase('product', {
  migrations: path.join(__dirname, 'migrations'),
});

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

    const offset = (page - 1) * limit;

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

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM products ${whereClause}`;
    const countResult = await db.query(countQuery, values);
    const totalCount = parseInt(countResult.rows[0].count);

    // Get products
    const query = `
      SELECT * FROM products
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    values.push(limit, offset);

    const result = await db.query(query, values);
    const products = result.rows.map(mapRowToProduct);

    return {
      products,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
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
