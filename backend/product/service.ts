import { api, APIError } from 'encore.dev/api';
import { SQLDatabase } from 'encore.dev/storage/sqldb';

// Database connection
const db = new SQLDatabase('product', {
  migrations: './migrations',
});

// Types
export interface Product {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  price: number;
  originalPrice?: number;
  weight: number; // grams
  purity: '925' | '999';
  serialNumber: string;
  category: string;
  images: string[];
  inStock: boolean;
  isNew: boolean;
  isFeatured: boolean;
  discount?: number;
  rating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFilters {
  categories?: string[];
  purities?: string[];
  priceRange?: [number, number];
  weightRange?: [number, number];
  inStock?: boolean;
  onSale?: boolean;
  sortBy?: 'newest' | 'price-asc' | 'price-desc' | 'popular' | 'weight';
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface ProductListResponse {
  products: Product[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

/**
 * List Products with Filtering & Pagination
 * Implements best practices from luxury e-commerce
 */
export const list = api(
  { expose: true, method: 'GET', path: '/products' },
  async (params: {
    filters?: ProductFilters;
    pagination?: PaginationParams;
  }): Promise<ProductListResponse> => {
    const { filters = {}, pagination = { page: 1, limit: 12 } } = params;
    const offset = (pagination.page - 1) * pagination.limit;

    // Build WHERE clause
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (filters.categories && filters.categories.length > 0) {
      conditions.push(`category = ANY($${paramIndex})`);
      values.push(filters.categories);
      paramIndex++;
    }

    if (filters.purities && filters.purities.length > 0) {
      conditions.push(`purity = ANY($${paramIndex})`);
      values.push(filters.purities);
      paramIndex++;
    }

    if (filters.priceRange) {
      conditions.push(`price BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
      values.push(filters.priceRange[0], filters.priceRange[1]);
      paramIndex += 2;
    }

    if (filters.weightRange) {
      conditions.push(`weight BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
      values.push(filters.weightRange[0], filters.weightRange[1]);
      paramIndex += 2;
    }

    if (filters.inStock) {
      conditions.push(`in_stock = true`);
    }

    if (filters.onSale) {
      conditions.push(`discount > 0`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Build ORDER BY clause
    let orderBy = 'created_at DESC'; // Default: newest first
    switch (filters.sortBy) {
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
    values.push(pagination.limit, offset);

    const result = await db.query(query, values);
    const products = result.rows.map(mapRowToProduct);

    return {
      products,
      totalCount,
      totalPages: Math.ceil(totalCount / pagination.limit),
      currentPage: pagination.page,
    };
  }
);

/**
 * Get Single Product by ID
 */
export const getById = api(
  { expose: true, method: 'GET', path: '/products/:id' },
  async ({ id }: { id: string }): Promise<Product> => {
    const result = await db.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      throw APIError.notFound('Product not found');
    }

    return mapRowToProduct(result.rows[0]);
  }
);

/**
 * Get Featured Products
 */
export const getFeatured = api(
  { expose: true, method: 'GET', path: '/products/featured' },
  async ({ limit = 8 }: { limit?: number }): Promise<Product[]> => {
    const result = await db.query(
      'SELECT * FROM products WHERE is_featured = true ORDER BY created_at DESC LIMIT $1',
      [limit]
    );

    return result.rows.map(mapRowToProduct);
  }
);

/**
 * Get Related Products (Cross-sell)
 */
export const getRelated = api(
  { expose: true, method: 'GET', path: '/products/:id/related' },
  async ({ id, limit = 4 }: { id: string; limit?: number }): Promise<Product[]> => {
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

    return result.rows.map(mapRowToProduct);
  }
);

/**
 * Search Products
 */
export const search = api(
  { expose: true, method: 'GET', path: '/products/search' },
  async ({ query }: { query: string }): Promise<Product[]> => {
    const result = await db.query(
      `SELECT * FROM products 
       WHERE name ILIKE $1 OR description ILIKE $1 OR serial_number ILIKE $1
       ORDER BY rating DESC
       LIMIT 20`,
      [`%${query}%`]
    );

    return result.rows.map(mapRowToProduct);
  }
);

/**
 * Get Product Categories
 */
export const getCategories = api(
  { expose: true, method: 'GET', path: '/products/categories' },
  async (): Promise<{ name: string; count: number }[]> => {
    const result = await db.query(
      `SELECT category as name, COUNT(*) as count 
       FROM products 
       GROUP BY category 
       ORDER BY count DESC`
    );

    return result.rows.map((row) => ({
      name: row.name,
      count: parseInt(row.count),
    }));
  }
);

/**
 * Create Product (Admin only)
 */
export const create = api(
  { expose: true, method: 'POST', path: '/products', auth: true },
  async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    const result = await db.query(
      `INSERT INTO products (
        name, name_en, description, price, original_price, weight, purity,
        serial_number, category, images, in_stock, is_new, is_featured,
        discount, rating, review_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        product.name,
        product.nameEn,
        product.description,
        product.price,
        product.originalPrice,
        product.weight,
        product.purity,
        product.serialNumber,
        product.category,
        JSON.stringify(product.images),
        product.inStock,
        product.isNew,
        product.isFeatured,
        product.discount,
        product.rating,
        product.reviewCount,
      ]
    );

    return mapRowToProduct(result.rows[0]);
  }
);

/**
 * Update Product (Admin only)
 */
export const update = api(
  { expose: true, method: 'PUT', path: '/products/:id', auth: true },
  async ({ id, ...updates }: Partial<Product> & { id: string }): Promise<Product> => {
    const result = await db.query(
      `UPDATE products 
       SET name = COALESCE($2, name),
           description = COALESCE($3, description),
           price = COALESCE($4, price),
           in_stock = COALESCE($5, in_stock),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, updates.name, updates.description, updates.price, updates.inStock]
    );

    if (result.rows.length === 0) {
      throw APIError.notFound('Product not found');
    }

    return mapRowToProduct(result.rows[0]);
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
    originalPrice: row.original_price ? parseFloat(row.original_price) : undefined,
    weight: parseFloat(row.weight),
    purity: row.purity,
    serialNumber: row.serial_number,
    category: row.category,
    images: typeof row.images === 'string' ? JSON.parse(row.images) : row.images,
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
