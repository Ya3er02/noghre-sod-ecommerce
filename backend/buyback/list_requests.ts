import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { BuybackRequest, BuybackStatus } from "./types";

interface ListBuybackRequestsParams {
  status: Query<string>;
  limit: Query<number>;
  offset: Query<number>;
}

interface ListBuybackRequestsResponse {
  requests: BuybackRequest[];
  total: number;
}

export const listRequests = api<ListBuybackRequestsParams, ListBuybackRequestsResponse>(
  { auth: true, expose: true, method: "GET", path: "/buyback/requests" },
  async ({ status, limit = 20, offset = 0 }) => {
    const auth = getAuthData()!;
    const userId = auth.userID;
    const conditions: string[] = [`user_id = $1`];
    const params: any[] = [userId];
    let paramIndex = 2;

    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countQuery = `SELECT COUNT(*) as count FROM buyback_requests ${whereClause}`;
    const countResult = await db.rawQueryRow<{ count: string }>(countQuery, ...params);
    const total = parseInt(countResult?.count || "0", 10);

    params.push(limit, offset);
    const dataQuery = `
      SELECT * FROM buyback_requests
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const rows = await db.rawQueryAll<{
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
    }>(dataQuery, ...params);

    const requests: BuybackRequest[] = rows.map(row => ({
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
    }));

    return { requests, total };
  }
);
