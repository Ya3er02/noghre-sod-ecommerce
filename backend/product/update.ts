import { api, APIError } from 'encore.dev/api';
import { db } from './db';
import { mapRowToProduct } from './utils';
import type { Product } from './types';

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
    if (!id || typeof id !== 'string') {
      throw APIError.invalidArgument('Product ID is required');
    }

    try {
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

      if (!result?.rows?.[0]) {
        throw APIError.notFound('Product not found');
      }

      return mapRowToProduct(result.rows[0]);
    } catch (error) {
      if (error instanceof Error && error.message?.includes('not found')) {
        throw error;
      }
      console.error(`Error updating product '${id}':`, error);
      throw APIError.internal('Failed to update product');
    }
  }
);
