import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { BuybackRequest, CreateBuybackRequest, BuybackStatus } from "./types";

export const createRequest = api<CreateBuybackRequest, BuybackRequest>(
  { auth: true, expose: true, method: "POST", path: "/buyback/requests" },
  async (req) => {
    const auth = getAuthData()!;
    const userId = auth.userID;
    const serialExists = await db.queryRow`
      SELECT serial FROM scan2value_products WHERE serial = ${req.serial}
    `;
    if (!serialExists) {
      throw APIError.notFound("serial number not found");
    }

    const requestNumber = `BB-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const row = await db.queryRow<{
      id: string;
      request_number: string;
      user_id: string;
      serial: string;
      type: string;
      requested_qty_g: number | null;
      quoted_price_irr: number;
      evidence_photos: string[];
      status: string;
      return_method: string | null;
      tracking_code: string | null;
      approved_by: string | null;
      approved_at: Date | null;
      final_price_irr: number | null;
      paid_at: Date | null;
      admin_notes: string | null;
      created_at: Date;
      updated_at: Date;
    }>`
      INSERT INTO buyback_requests (
        request_number, user_id, serial, type, requested_qty_g,
        quoted_price_irr, evidence_photos, return_method
      )
      VALUES (
        ${requestNumber}, ${userId}, ${req.serial}, ${req.type},
        ${req.requestedQtyG || null}, ${req.quotedPriceIrr},
        ${req.evidencePhotos}, ${req.returnMethod || null}
      )
      RETURNING *
    `;

    if (!row) {
      throw APIError.internal("failed to create buyback request");
    }

    return {
      id: row.id,
      requestNumber: row.request_number,
      userId: row.user_id,
      serial: row.serial,
      type: row.type,
      requestedQtyG: row.requested_qty_g || undefined,
      quotedPriceIrr: row.quoted_price_irr,
      evidencePhotos: row.evidence_photos,
      status: row.status as BuybackStatus,
      returnMethod: row.return_method || undefined,
      trackingCode: row.tracking_code || undefined,
      approvedBy: row.approved_by || undefined,
      approvedAt: row.approved_at || undefined,
      finalPriceIrr: row.final_price_irr || undefined,
      paidAt: row.paid_at || undefined,
      adminNotes: row.admin_notes || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
);
