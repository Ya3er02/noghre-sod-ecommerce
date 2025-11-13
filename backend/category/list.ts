import { api } from "encore.dev/api";
import db from "../db";
import type { CategoryWithChildren } from "./types";

interface ListCategoriesResponse {
  categories: CategoryWithChildren[];
}

// Lists all active categories in a hierarchical structure.
export const list = api<void, ListCategoriesResponse>(
  { expose: true, method: "GET", path: "/categories" },
  async () => {
    const rows = await db.queryAll<{
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
      SELECT * FROM categories
      WHERE is_active = true
      ORDER BY sort_order ASC, name ASC
    `;

    const categoryMap = new Map<string, CategoryWithChildren>();
    const rootCategories: CategoryWithChildren[] = [];

    rows.forEach(row => {
      const category: CategoryWithChildren = {
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description || undefined,
        parentId: row.parent_id || undefined,
        isActive: row.is_active,
        sortOrder: row.sort_order,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        children: [],
      };
      categoryMap.set(row.id, category);
    });

    categoryMap.forEach(category => {
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });

    return { categories: rootCategories };
  }
);
