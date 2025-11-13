import { api, APIError } from "encore.dev/api";
import db from "../db";
import type { Scan2ValueProduct, CreateScan2ValueProductRequest } from "./types";

// Creates a new scan2value product entry.
export const createScan2ValueProduct = api<CreateScan2ValueProductRequest, Scan2ValueProduct>(
  { expose: true, method: "POST", path: "/admin/scan2value/products" },
  async (req) => {
    const exists = await db.queryRow`
      SELECT serial FROM scan2value_products WHERE serial = ${req.serial}
    `;
    if (exists) {
      throw APIError.alreadyExists("serial already exists");
    }

    const row = await db.queryRow<{
      serial: string;
      weight_g: number;
      fineness: number;
      buy_price_per_g_irr: number;
      buy_date: Date;
      branch: string;
      status: string;
      remaining_weight_g: number;
      qr_payload_hash: string;
      created_at: Date;
      updated_at: Date;
    }>`
      INSERT INTO scan2value_products (
        serial, weight_g, fineness, buy_price_per_g_irr, buy_date,
        branch, status, remaining_weight_g, qr_payload_hash
      )
      VALUES (
        ${req.serial}, ${req.weightG}, ${req.fineness}, ${req.buyPricePerGIrr},
        ${req.buyDate}, ${req.branch}, ${req.status}, ${req.remainingWeightG},
        ${req.qrPayloadHash}
      )
      RETURNING *
    `;

    if (!row) {
      throw APIError.internal("failed to create scan2value product");
    }

    return {
      serial: row.serial,
      weightG: row.weight_g,
      fineness: row.fineness,
      buyPricePerGIrr: row.buy_price_per_g_irr,
      buyDate: row.buy_date,
      branch: row.branch,
      status: row.status,
      remainingWeightG: row.remaining_weight_g,
      qrPayloadHash: row.qr_payload_hash,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
);
