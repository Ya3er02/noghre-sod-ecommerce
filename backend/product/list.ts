import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";
import type { Product } from "./types";

interface ListProductsParams {
  categoryId?: Query<string>;
  featured?: Query<boolean>;
  limit?: Query<number>;
  offset?: Query<number>;
}

interface ListProductsResponse {
  products: Product[];
  total: number;
}

// Lists products with optional filtering.
export const list = api<ListProductsParams, ListProductsResponse>(
  { expose: true, method: "GET", path: "/products" },
  async ({ categoryId, featured, limit = 20, offset = 0 }) => {
    const conditions: string[] = ["p.is_active = true"];
    const params: any[] = [];
    let paramIndex = 1;

    if (categoryId) {
      conditions.push(`p.category_id = $${paramIndex++}`);
      params.push(categoryId);
    }

    if (featured) {
      conditions.push(`p.is_featured = true`);
    }

    const whereClause = conditions.join(" AND ");

    const countQuery = `
      SELECT COUNT(*) as count
      FROM products p
      WHERE ${whereClause}
    `;

    const countResult = await db.rawQueryRow<{ count: string }>(countQuery, ...params);
    const total = parseInt(countResult?.count || "0", 10);

    params.push(limit, offset);
    const dataQuery = `
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
      WHERE ${whereClause}
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const rows = await db.rawQueryAll<any>(dataQuery, ...params);

    const products: Product[] = rows.map(row => ({
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
    }));

    return { products, total };
  }
);
