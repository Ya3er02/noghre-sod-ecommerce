import { api, APIError } from "encore.dev/api";
import db from "../db";
import type { ProductInstance, CreateInstanceRequest, InstanceStatus } from "./types";

// Creates a new serialized product instance.
export const createInstance = api<CreateInstanceRequest, ProductInstance>(
  { expose: true, method: "POST", path: "/admin/inventory/instances" },
  async (req) => {
    const productExists = await db.queryRow`
      SELECT id FROM products WHERE id = ${req.productId}
    `;
    if (!productExists) {
      throw APIError.notFound("product not found");
    }

    const serialExists = await db.queryRow`
      SELECT id FROM product_instances WHERE serial = ${req.serial}
    `;
    if (serialExists) {
      throw APIError.alreadyExists("serial number already exists");
    }

    const row = await db.queryRow<{
      id: string;
      product_id: string;
      serial: string;
      status: string;
      sold_at: Date | null;
      order_id: string | null;
      created_at: Date;
      updated_at: Date;
    }>`
      INSERT INTO product_instances (product_id, serial, status)
      VALUES (${req.productId}, ${req.serial}, 'AVAILABLE')
      RETURNING *
    `;

    if (!row) {
      throw APIError.internal("failed to create instance");
    }

    await db.exec`
      UPDATE products
      SET stock_count = stock_count + 1, updated_at = NOW()
      WHERE id = ${req.productId}
    `;

    return {
      id: row.id,
      productId: row.product_id,
      serial: row.serial,
      status: row.status as InstanceStatus,
      soldAt: row.sold_at || undefined,
      orderId: row.order_id || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
);
