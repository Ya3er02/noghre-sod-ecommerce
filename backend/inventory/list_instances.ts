import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";
import type { ProductInstance } from "./types";

interface ListInstancesParams {
  productId: Query<string>;
  status: Query<string>;
  limit: Query<number>;
  offset: Query<number>;
}

interface ListInstancesResponse {
  instances: ProductInstance[];
  total: number;
}

// Lists product instances with optional filtering.
export const listInstances = api<ListInstancesParams, ListInstancesResponse>(
  { expose: true, method: "GET", path: "/admin/inventory/instances" },
  async ({ productId, status, limit = 50, offset = 0 }) => {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (productId) {
      conditions.push(`product_id = $${paramIndex++}`);
      params.push(productId);
    }

    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countQuery = `SELECT COUNT(*) as count FROM product_instances ${whereClause}`;
    const countResult = await db.rawQueryRow<{ count: string }>(countQuery, ...params);
    const total = parseInt(countResult?.count || "0", 10);

    params.push(limit, offset);
    const dataQuery = `
      SELECT * FROM product_instances
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const rows = await db.rawQueryAll<{
      id: string;
      product_id: string;
      serial: string;
      status: string;
      sold_at: Date | null;
      order_id: string | null;
      created_at: Date;
      updated_at: Date;
    }>(dataQuery, ...params);

    const instances: ProductInstance[] = rows.map(row => ({
      id: row.id,
      productId: row.product_id,
      serial: row.serial,
      status: row.status as any,
      soldAt: row.sold_at || undefined,
      orderId: row.order_id || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { instances, total };
  }
);
