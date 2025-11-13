import { api, APIError } from "encore.dev/api";
import db from "../db";
import type { Product, CreateProductRequest } from "./types";

// Creates a new product.
export const create = api<CreateProductRequest, Product>(
  { expose: true, method: "POST", path: "/admin/products" },
  async (req) => {
    const categoryExists = await db.queryRow`
      SELECT id FROM categories WHERE id = ${req.categoryId}
    `;
    if (!categoryExists) {
      throw APIError.notFound("category not found");
    }

    const skuExists = await db.queryRow`
      SELECT id FROM products WHERE sku = ${req.sku}
    `;
    if (skuExists) {
      throw APIError.alreadyExists("product with this SKU already exists");
    }

    const slugExists = await db.queryRow`
      SELECT id FROM products WHERE slug = ${req.slug}
    `;
    if (slugExists) {
      throw APIError.alreadyExists("product with this slug already exists");
    }

    const row = await db.queryRow<{
      id: string;
      sku: string;
      name: string;
      slug: string;
      description: string;
      weight_g: number;
      fineness: number;
      dimensions: string | null;
      base_price_irr: number;
      premium_percent: number;
      use_live_price: boolean;
      stock_status: string;
      stock_count: number;
      category_id: string;
      is_active: boolean;
      is_featured: boolean;
      created_at: Date;
      updated_at: Date;
    }>`
      INSERT INTO products (
        sku, name, slug, description, weight_g, fineness, dimensions,
        base_price_irr, premium_percent, use_live_price, stock_status,
        stock_count, category_id, is_featured
      )
      VALUES (
        ${req.sku}, ${req.name}, ${req.slug}, ${req.description},
        ${req.weightG}, ${req.fineness}, ${req.dimensions || null},
        ${req.basePriceIrr}, ${req.premiumPercent || 0}, ${req.useLivePrice !== false},
        ${req.stockStatus || "IN_STOCK"}, ${req.stockCount || 0},
        ${req.categoryId}, ${req.isFeatured || false}
      )
      RETURNING *
    `;

    if (!row) {
      throw APIError.internal("failed to create product");
    }

    const images = [];
    if (req.images && req.images.length > 0) {
      for (const img of req.images) {
        const imageRow = await db.queryRow<{
          id: string;
          product_id: string;
          url: string;
          alt_text: string | null;
          sort_order: number;
          is_primary: boolean;
        }>`
          INSERT INTO product_images (product_id, url, alt_text, sort_order, is_primary)
          VALUES (${row.id}, ${img.url}, ${img.altText || null}, ${img.sortOrder || 0}, ${img.isPrimary || false})
          RETURNING *
        `;
        if (imageRow) {
          images.push({
            id: imageRow.id,
            productId: imageRow.product_id,
            url: imageRow.url,
            altText: imageRow.alt_text || undefined,
            sortOrder: imageRow.sort_order,
            isPrimary: imageRow.is_primary,
          });
        }
      }
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
      stockStatus: row.stock_status as any,
      stockCount: row.stock_count,
      categoryId: row.category_id,
      isActive: row.is_active,
      isFeatured: row.is_featured,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      images,
    };
  }
);
