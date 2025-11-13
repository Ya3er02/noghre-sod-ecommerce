import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { User } from "./types";

export const getProfile = api<void, User>(
  { auth: true, expose: true, method: "GET", path: "/user/me" },
  async () => {
    const auth = getAuthData()!;
    const id = auth.userID;
    const row = await db.queryRow<{
      id: string;
      email: string;
      phone: string | null;
      first_name: string;
      last_name: string;
      national_code: string | null;
      is_active: boolean;
      email_verified: boolean;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT * FROM users WHERE id = ${id}
    `;

    if (!row) {
      throw APIError.notFound("user not found");
    }

    return {
      id: row.id,
      email: row.email,
      phone: row.phone || undefined,
      firstName: row.first_name,
      lastName: row.last_name,
      nationalCode: row.national_code || undefined,
      isActive: row.is_active,
      emailVerified: row.email_verified,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
);
