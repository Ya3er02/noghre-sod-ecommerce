import { api, APIError } from "encore.dev/api";
import db from "../db";
import type { User } from "./types";

interface CreateUserRequest {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  nationalCode?: string;
}

// Creates a new user (called by Clerk webhook).
export const createUser = api<CreateUserRequest, User>(
  { expose: true, method: "POST", path: "/users" },
  async (req) => {
    const exists = await db.queryRow`
      SELECT id FROM users WHERE id = ${req.id}
    `;
    if (exists) {
      throw APIError.alreadyExists("user already exists");
    }

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
      INSERT INTO users (id, email, phone, first_name, last_name, national_code)
      VALUES (${req.id}, ${req.email}, ${req.phone || null}, ${req.firstName}, ${req.lastName}, ${req.nationalCode || null})
      RETURNING *
    `;

    if (!row) {
      throw APIError.internal("failed to create user");
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
