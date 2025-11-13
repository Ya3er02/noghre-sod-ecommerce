import { api, APIError } from "encore.dev/api";
import db from "../db";
import type { Product } from "./types";

// Retrieves a single product by slug.
export const get = api<{ slug: string }, Product>(
  { expose: true, method: "GET", path: "/products/:slug" },
  async ({ slug }) => {
    const row = await db.rawQueryRow<any>(`
      SELECT p.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', pi.id,
                   'productId', pi.product_id,
                   'url', pi.url,
                   'altText', pi.alt_text,
                   'sortOrder', pi.sort_order,
                   'isPrimary', pi.is_primary
                 ) ORDER BY pi.sort_order, pi.is_primary DESC
               ) FILTER (WHERE pi.id IS NOT NULL),
               '[]'
             ) as images
      FROM products p
      LEFT JOIN product_images pi ON pi.product_id = p.id
      WHERE p.slug = $1
      GROUP BY p.id
    `, slug);

    if (!row) {
      throw APIError.notFound("product not found");
    }

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
      images: row.images,
    };
  }
);
