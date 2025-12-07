import { api, APIError } from 'encore.dev/api';
import { db } from './db';
import { mapRowToProduct } from './utils';
import type { Product } from './types';

export interface CreateProductRequest
  extends Omit<Product, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * Create Product (Admin only)
 */
export const createProduct = api(
  { expose: true, method: 'POST', path: '/products/create', auth: true },
  async (product: CreateProductRequest): Promise<Product> => {
    // Validate required fields
    if (!product.name || !product.description || product.price === undefined) {
      throw APIError.invalidArgument(
        'name, description, and price are required'
      );
    }

    try {
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

      // Validate insert result
      if (!result || !Array.isArray(result.rows) || result.rows.length === 0) {
        throw new Error('Failed to create product - no row returned');
      }

      return mapRowToProduct(result.rows[0]);
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          `Error creating product '${product.name}':`,
          error.message
        );
        if (error.message.includes('duplicate')) {
          throw APIError.alreadyExists(
            `Product with serial number '${product.serialNumber}' already exists`
          );
        }
        if (error.message.includes('constraint')) {
          throw APIError.invalidArgument('Invalid product data: ' + error.message);
        }
      }
      console.error('Error creating product:', error);
      throw APIError.internal('Failed to create product');
    }
  }
);
