import { api, APIError } from 'encore.dev/api';
import { SQLDatabase } from 'encore.dev/storage/sqldb';
import * as path from 'path';

// Database connection
const db = new SQLDatabase('buyback', {
  migrations: path.join(__dirname, 'migrations'),
});

export interface BuybackRequest {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  description: string;
  images: string[];
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  estimatedPrice?: number;
  finalPrice?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BuybackListResponse {
  requests: BuybackRequest[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Get all buyback requests (Admin)
 */
export const listBuybackRequests = api(
  {
    expose: true,
    method: 'GET',
    path: '/buyback/requests',
    auth: true,
  },
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number }) => {
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT * FROM buyback_requests 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await db.query(`SELECT COUNT(*) FROM buyback_requests`);
    const total = parseInt(countResult.rows[0].count);

    const requests = result.rows.map(mapRowToRequest);

    return {
      requests,
      total,
      page,
      limit,
    };
  }
);

/**
 * Get user's buyback requests
 */
export const getUserBuybackRequests = api(
  {
    expose: true,
    method: 'GET',
    path: '/buyback/user-requests/:userId',
    auth: true,
  },
  async ({ userId }: { userId: string }) => {
    const result = await db.query(
      `SELECT * FROM buyback_requests 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );

    const requests = result.rows.map(mapRowToRequest);

    return {
      requests,
      count: requests.length,
    };
  }
);

/**
 * Get specific buyback request
 */
export const getBuybackRequest = api(
  {
    expose: true,
    method: 'GET',
    path: '/buyback/requests/:id',
    auth: true,
  },
  async ({ id }: { id: string }): Promise<BuybackRequest> => {
    const result = await db.query(
      `SELECT * FROM buyback_requests WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw APIError.notFound('Buyback request not found');
    }

    return mapRowToRequest(result.rows[0]);
  }
);

/**
 * Approve buyback request
 */
export const approveBuybackRequest = api(
  {
    expose: true,
    method: 'PUT',
    path: '/buyback/requests/:id/approve',
    auth: true,
  },
  async ({
    id,
    estimatedPrice,
  }: {
    id: string;
    estimatedPrice: number;
  }): Promise<BuybackRequest> => {
    const result = await db.query(
      `UPDATE buyback_requests 
       SET status = 'approved', estimated_price = $2, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, estimatedPrice]
    );

    if (result.rows.length === 0) {
      throw APIError.notFound('Buyback request not found');
    }

    return mapRowToRequest(result.rows[0]);
  }
);

/**
 * Reject buyback request
 */
export const rejectBuybackRequest = api(
  {
    expose: true,
    method: 'PUT',
    path: '/buyback/requests/:id/reject',
    auth: true,
  },
  async ({ id }: { id: string }): Promise<BuybackRequest> => {
    const result = await db.query(
      `UPDATE buyback_requests 
       SET status = 'rejected', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      throw APIError.notFound('Buyback request not found');
    }

    return mapRowToRequest(result.rows[0]);
  }
);

// Helper function
function mapRowToRequest(row: any): BuybackRequest {
  return {
    id: row.id,
    userId: row.user_id,
    productId: row.product_id,
    quantity: row.quantity,
    description: row.description,
    images:
      typeof row.images === 'string' ? JSON.parse(row.images) : row.images,
    status: row.status,
    estimatedPrice: row.estimated_price,
    finalPrice: row.final_price,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
