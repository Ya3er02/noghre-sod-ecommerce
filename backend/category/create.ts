import { api, APIError } from "encore.dev/api";
import db from "../db";
import type { Category, CreateCategoryRequest } from "./types";

// Creates a new product category.
export const create = api<CreateCategoryRequest, Category>(
  { expose: true, method: "POST", path: "/admin/categories" },
  async (req) => {
    if (req.parentId) {
      const parent = await db.queryRow`
        SELECT id FROM categories WHERE id = ${req.parentId}
      `;
      if (!parent) {
        throw APIError.notFound("parent category not found");
      }
    }

    const existing = await db.queryRow`
      SELECT id FROM categories WHERE slug = ${req.slug}
    `;
    if (existing) {
      throw APIError.alreadyExists("category with this slug already exists");
    }

    const row = await db.queryRow<{
      id: string;
      name: string;
      slug: string;
      description: string | null;
      parent_id: string | null;
      is_active: boolean;
      sort_order: number;
      created_at: Date;
      updated_at: Date;
    }>`
      INSERT INTO categories (name, slug, description, parent_id, sort_order)
      VALUES (${req.name}, ${req.slug}, ${req.description || null}, ${req.parentId || null}, ${req.sortOrder || 0})
      RETURNING *
    `;

    if (!row) {
      throw APIError.internal("failed to create category");
    }

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description || undefined,
      parentId: row.parent_id || undefined,
      isActive: row.is_active,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
);
