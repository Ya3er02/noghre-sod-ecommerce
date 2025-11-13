import { api, APIError } from "encore.dev/api";
import db from "../db";
import type { Category, UpdateCategoryRequest } from "./types";

// Updates an existing category.
export const update = api<UpdateCategoryRequest, Category>(
  { expose: true, method: "PATCH", path: "/admin/categories/:id" },
  async (req) => {
    const existing = await db.queryRow`
      SELECT id FROM categories WHERE id = ${req.id}
    `;
    if (!existing) {
      throw APIError.notFound("category not found");
    }

    if (req.slug) {
      const slugExists = await db.queryRow`
        SELECT id FROM categories WHERE slug = ${req.slug} AND id != ${req.id}
      `;
      if (slugExists) {
        throw APIError.alreadyExists("category with this slug already exists");
      }
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
    if (req.parentId !== undefined) {
      updates.push(`parent_id = $${paramIndex++}`);
      values.push(req.parentId);
    }
    if (req.isActive !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(req.isActive);
    }
    if (req.sortOrder !== undefined) {
      updates.push(`sort_order = $${paramIndex++}`);
      values.push(req.sortOrder);
    }

    updates.push(`updated_at = NOW()`);
    values.push(req.id);

    const query = `
      UPDATE categories
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const row = await db.rawQueryRow<{
      id: string;
      name: string;
      slug: string;
      description: string | null;
      parent_id: string | null;
      is_active: boolean;
      sort_order: number;
      created_at: Date;
      updated_at: Date;
    }>(query, ...values);

    if (!row) {
      throw APIError.internal("failed to update category");
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
