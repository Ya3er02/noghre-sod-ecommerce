import { api, APIError } from "encore.dev/api";
import db from "../db";
import type { Address, CreateAddressRequest } from "./types";

interface ListAddressesResponse {
  addresses: Address[];
}

// Lists all addresses for a user.
export const listAddresses = api<{ userId: string }, ListAddressesResponse>(
  { expose: true, method: "GET", path: "/users/:userId/addresses" },
  async ({ userId }) => {
    const rows = await db.queryAll<{
      id: string;
      user_id: string;
      title: string;
      province: string;
      city: string;
      postal_code: string;
      full_address: string;
      is_default: boolean;
      created_at: Date;
    }>`
      SELECT * FROM addresses WHERE user_id = ${userId}
      ORDER BY is_default DESC, created_at DESC
    `;

    const addresses: Address[] = rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      province: row.province,
      city: row.city,
      postalCode: row.postal_code,
      fullAddress: row.full_address,
      isDefault: row.is_default,
      createdAt: row.created_at,
    }));

    return { addresses };
  }
);

// Creates a new address for a user.
export const createAddress = api<CreateAddressRequest, Address>(
  { expose: true, method: "POST", path: "/users/:userId/addresses" },
  async (req) => {
    if (req.isDefault) {
      await db.exec`
        UPDATE addresses SET is_default = false WHERE user_id = ${req.userId}
      `;
    }

    const row = await db.queryRow<{
      id: string;
      user_id: string;
      title: string;
      province: string;
      city: string;
      postal_code: string;
      full_address: string;
      is_default: boolean;
      created_at: Date;
    }>`
      INSERT INTO addresses (user_id, title, province, city, postal_code, full_address, is_default)
      VALUES (${req.userId}, ${req.title}, ${req.province}, ${req.city}, ${req.postalCode}, ${req.fullAddress}, ${req.isDefault || false})
      RETURNING *
    `;

    if (!row) {
      throw APIError.internal("failed to create address");
    }

    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      province: row.province,
      city: row.city,
      postalCode: row.postal_code,
      fullAddress: row.full_address,
      isDefault: row.is_default,
      createdAt: row.created_at,
    };
  }
);
