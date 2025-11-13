import { api, APIError } from "encore.dev/api";
import db from "../db";
import type { Product, UpdateProductRequest } from "./types";

// Updates an existing product.
export const update = api<UpdateProductRequest, Product>(
  { expose: true, method: "PATCH", path: "/admin/products/:id" },
  async (req) => {
    const existing = await db.queryRow`
      SELECT id FROM products WHERE id = ${req.id}
    `;
    if (!existing) {
      throw APIError.notFound("product not found");
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (req.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(req.name);
    }
    if (req.slug !== undefined) {
      updates.push(`slug = $${paramIndex++}`);
      values.push(req.slug);
    }
    if (req.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(req.description);
    }
    if (req.weightG !== undefined) {
      updates.push(`weight_g = $${paramIndex++}`);
      values.push(req.weightG);
    }
    if (req.fineness !== undefined) {
      updates.push(`fineness = $${paramIndex++}`);
      values.push(req.fineness);
    }
    if (req.dimensions !== undefined) {
      updates.push(`dimensions = $${paramIndex++}`);
      values.push(req.dimensions);
    }
    if (req.basePriceIrr !== undefined) {
      updates.push(`base_price_irr = $${paramIndex++}`);
      values.push(req.basePriceIrr);
    }
    if (req.premiumPercent !== undefined) {
      updates.push(`premium_percent = $${paramIndex++}`);
      values.push(req.premiumPercent);
    }
    if (req.useLivePrice !== undefined) {
      updates.push(`use_live_price = $${paramIndex++}`);
      values.push(req.useLivePrice);
    }
    if (req.stockStatus !== undefined) {
      updates.push(`stock_status = $${paramIndex++}`);
      values.push(req.stockStatus);
    }
    if (req.stockCount !== undefined) {
      updates.push(`stock_count = $${paramIndex++}`);
      values.push(req.stockCount);
    }
    if (req.categoryId !== undefined) {
      updates.push(`category_id = $${paramIndex++}`);
      values.push(req.categoryId);
    }
    if (req.isActive !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(req.isActive);
    }
    if (req.isFeatured !== undefined) {
      updates.push(`is_featured = $${paramIndex++}`);
      values.push(req.isFeatured);
    }

    updates.push(`updated_at = NOW()`);
    values.push(req.id);

    const query = `
      UPDATE products
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const row = await db.rawQueryRow<any>(query, ...values);
    if (!row) {
      throw APIError.internal("failed to update product");
    }

    const images = await db.queryAll<{
      id: string;
      product_id: string;
      url: string;
      alt_text: string | null;
      sort_order: number;
      is_primary: boolean;
    }>`
      SELECT * FROM product_images WHERE product_id = ${req.id}
      ORDER BY sort_order, is_primary DESC
    `;

    return {
      id: row.id,
      sku: row.sku,
      name: row.name,
      slug: row.slug,
      description: row.description,
      weightG: row.weight_g,
      fineness: row.fineness,
      dimensions: row.dimensions || undefined,
      basePriceIrr: row.base_price_irr,
      premiumPercent: row.premium_percent,
      useLivePrice: row.use_live_price,
      stockStatus: row.stock_status,
      stockCount: row.stock_count,
      categoryId: row.category_id,
      isActive: row.is_active,
      isFeatured: row.is_featured,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      images: images.map(img => ({
        id: img.id,
        productId: img.product_id,
        url: img.url,
        altText: img.alt_text || undefined,
        sortOrder: img.sort_order,
        isPrimary: img.is_primary,
      })),
    };
  }
);
