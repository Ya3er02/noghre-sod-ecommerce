import { api, APIError } from "encore.dev/api";
import db from "../db";

interface ToggleStockStatusRequest {
  id: string;
  stockStatus: "IN_STOCK" | "OUT_OF_STOCK" | "PRE_ORDER";
}

interface ToggleStockStatusResponse {
  success: boolean;
  stockStatus: string;
}

// Instantly toggles the stock status of a product.
export const toggleStockStatus = api<ToggleStockStatusRequest, ToggleStockStatusResponse>(
  { expose: true, method: "PATCH", path: "/admin/products/:id/stock-status" },
  async ({ id, stockStatus }) => {
    const row = await db.queryRow<{ stock_status: string }>`
      UPDATE products
      SET stock_status = ${stockStatus}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING stock_status
    `;

    if (!row) {
      throw APIError.notFound("product not found");
    }

    return {
      success: true,
      stockStatus: row.stock_status,
    };
  }
);
