import { api, APIError } from "encore.dev/api";
import db from "../db";

// Deletes a category if it has no products.
export const deleteCategory = api<{ id: string }, void>(
  { expose: true, method: "DELETE", path: "/admin/categories/:id" },
  async ({ id }) => {
    const hasProducts = await db.queryRow`
      SELECT id FROM products WHERE category_id = ${id} LIMIT 1
    `;
    if (hasProducts) {
      throw APIError.failedPrecondition("cannot delete category with products");
    }

    const hasChildren = await db.queryRow`
      SELECT id FROM categories WHERE parent_id = ${id} LIMIT 1
    `;
    if (hasChildren) {
      throw APIError.failedPrecondition("cannot delete category with subcategories");
    }

    await db.exec`DELETE FROM categories WHERE id = ${id}`;
  }
);
