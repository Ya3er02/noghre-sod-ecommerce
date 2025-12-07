import { api, APIError } from 'encore.dev/api';
import { SQLDatabase } from 'encore.dev/storage/sqldb';
import * as path from 'path';
import type { Product } from './types';

// Database connection
const db = new SQLDatabase('product', {
  migrations: path.join(__dirname, 'migrations'),
});

export interface UpdateProductRequest {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  inStock?: boolean;
}

/**
 * Update Product (Admin only)
 */
export const updateProduct = api(
  { expose: true, method: 'PUT', path: '/products/:id/update', auth: true },
  async ({
    id,
    name,
    description,
    price,
    inStock,
  }: UpdateProductRequest): Promise<Product> => {
    const result = await db.query(
      `UPDATE products 
       SET name = COALESCE($2, name),
           description = COALESCE($3, description),
           price = COALESCE($4, price),
           in_stock = COALESCE($5, in_stock),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, name, description, price, inStock]
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
