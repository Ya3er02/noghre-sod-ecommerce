import { api, APIError } from "encore.dev/api";
import db from "../db";
import type { BuybackRequest, UpdateBuybackStatusRequest } from "./types";

// Updates the status of a buyback request.
export const updateStatus = api<UpdateBuybackStatusRequest, BuybackRequest>(
  { expose: true, method: "PATCH", path: "/admin/buyback/requests/:id/status" },
  async (req) => {
    const updates: string[] = [`status = $1`, `updated_at = NOW()`];
    const values: any[] = [req.status];
    let paramIndex = 2;

    if (req.approvedBy !== undefined) {
      updates.push(`approved_by = $${paramIndex++}`);
      values.push(req.approvedBy);
      updates.push(`approved_at = NOW()`);
    }

    if (req.finalPriceIrr !== undefined) {
      updates.push(`final_price_irr = $${paramIndex++}`);
      values.push(req.finalPriceIrr);
    }

    if (req.adminNotes !== undefined) {
      updates.push(`admin_notes = $${paramIndex++}`);
      values.push(req.adminNotes);
    }

    if (req.status === "PAID") {
      updates.push(`paid_at = NOW()`);
    }

    values.push(req.id);

    const query = `
      UPDATE buyback_requests
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const row = await db.rawQueryRow<{
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
    }>(query, ...values);

    if (!row) {
      throw APIError.notFound("buyback request not found");
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
      status: row.status as any,
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
