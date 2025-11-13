import { api, APIError } from "encore.dev/api";
import db from "../db";
import type { BulkCreateInstancesRequest } from "./types";

interface BulkCreateResponse {
  created: number;
  failed: number;
  errors: string[];
}

// Creates multiple product instances at once.
export const bulkCreateInstances = api<BulkCreateInstancesRequest, BulkCreateResponse>(
  { expose: true, method: "POST", path: "/admin/inventory/instances/bulk" },
  async (req) => {
    const productExists = await db.queryRow`
      SELECT id FROM products WHERE id = ${req.productId}
    `;
    if (!productExists) {
      throw APIError.notFound("product not found");
    }

    let created = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const serial of req.serials) {
      try {
        const exists = await db.queryRow`
          SELECT id FROM product_instances WHERE serial = ${serial}
        `;
        
        if (exists) {
          failed++;
          errors.push(`Serial ${serial} already exists`);
          continue;
        }

        await db.exec`
          INSERT INTO product_instances (product_id, serial, status)
          VALUES (${req.productId}, ${serial}, 'AVAILABLE')
        `;
        
        created++;
      } catch (error) {
        failed++;
        errors.push(`Failed to create serial ${serial}`);
      }
    }

    if (created > 0) {
      await db.exec`
        UPDATE products
        SET stock_count = stock_count + ${created}, updated_at = NOW()
        WHERE id = ${req.productId}
      `;
    }

    return { created, failed, errors };
  }
);
