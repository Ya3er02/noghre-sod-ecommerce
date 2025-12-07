import { api } from 'encore.dev/api';
import { SQLDatabase } from 'encore.dev/storage/sqldb';
import * as path from 'path';
import type { Product } from './types';

// Database connection
const db = new SQLDatabase('product', {
  migrations: path.join(__dirname, 'migrations'),
});

export interface CreateProductRequest
  extends Omit<Product, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * Create Product (Admin only)
 */
export const createProduct = api(
  { expose: true, method: 'POST', path: '/products/create', auth: true },
  async (product: CreateProductRequest): Promise<Product> => {
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
