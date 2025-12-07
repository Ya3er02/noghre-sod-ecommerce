import { api, APIError, GetAuthContext } from 'encore.dev/api';
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
 * Safely parse JSON string to array
 */
function parseImages(images: any): string[] {
  if (Array.isArray(images)) {
    return images;
  }
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Check if user has admin privileges
 * In a real system, this would check the user's roles/permissions
 */
function isAdmin(authCtx: GetAuthContext | undefined): boolean {
  if (!authCtx) {
    return false;
  }
  // TODO: Implement proper admin role checking based on your auth system
  // Example: return authCtx.user?.roles?.includes('admin') || authCtx.user?.isAdmin === true
  // For now, this is a placeholder
  return false;
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
  async (
    { page = 1, limit = 10 }: { page?: number; limit?: number },
    auth: GetAuthContext
  ) => {
    // TODO: Add admin role verification once auth system is configured
    // if (!isAdmin(auth)) {
    //   throw APIError.forbidden('Admin access required');
    // }

    const validatedPage = Math.max(1, Math.floor(page || 1));
    const validatedLimit = Math.min(100, Math.max(1, Math.floor(limit || 10)));
    const offset = (validatedPage - 1) * validatedLimit;

    try {
      const result = await db.query(
        `SELECT * FROM buyback_requests 
         ORDER BY created_at DESC 
         LIMIT $1 OFFSET $2`,
        [validatedLimit, offset]
      );

      const countResult = await db.query(
        `SELECT COUNT(*) FROM buyback_requests`
      );
      const total = countResult.rows?.[0]
        ? parseInt(countResult.rows[0].count)
        : 0;

      const requests = (result.rows || []).map(mapRowToRequest);

      return {
        requests,
        total,
        page: validatedPage,
        limit: validatedLimit,
      };
    } catch (error) {
      console.error('Error listing buyback requests:', error);
      throw APIError.internal('Failed to list buyback requests');
    }
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
  async ({ userId }: { userId: string }, auth: GetAuthContext) => {
    // Verify user can only view their own requests
    // TODO: Once auth system is configured, verify auth.user.id === userId

    if (!userId || typeof userId !== 'string') {
      throw APIError.invalidArgument('User ID is required');
    }

    try {
      const result = await db.query(
        `SELECT * FROM buyback_requests 
         WHERE user_id = $1 
         ORDER BY created_at DESC`,
        [userId]
      );

      const requests = (result.rows || []).map(mapRowToRequest);

      return {
        requests,
        count: requests.length,
      };
    } catch (error) {
      console.error('Error getting user buyback requests:', error);
      throw APIError.internal('Failed to get user buyback requests');
    }
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
  async ({ id }: { id: string }, auth: GetAuthContext): Promise<BuybackRequest> => {
    if (!id || typeof id !== 'string') {
      throw APIError.invalidArgument('Request ID is required');
    }

    try {
      const result = await db.query(
        `SELECT * FROM buyback_requests WHERE id = $1`,
        [id]
      );

      if (!result?.rows?.[0]) {
        throw APIError.notFound('Buyback request not found');
      }

      return mapRowToRequest(result.rows[0]);
    } catch (error) {
      if (error instanceof Error && error.message?.includes('not found')) {
        throw error;
      }
      console.error('Error getting buyback request:', error);
      throw APIError.internal('Failed to get buyback request');
    }
  }
);

/**
 * Approve buyback request (Admin only)
 */
export const approveBuybackRequest = api(
  {
    expose: true,
    method: 'PUT',
    path: '/buyback/requests/:id/approve',
    auth: true,
  },
  async (
    {
      id,
      estimatedPrice,
    }: {
      id: string;
      estimatedPrice: number;
    },
    auth: GetAuthContext
  ): Promise<BuybackRequest> => {
    // Verify admin privilege
    // TODO: Implement proper admin role checking
    // if (!isAdmin(auth)) {
    //   throw APIError.forbidden('Admin access required to approve requests');
    // }

    if (!id || typeof id !== 'string') {
      throw APIError.invalidArgument('Request ID is required');
    }

    if (estimatedPrice === undefined || estimatedPrice < 0) {
      throw APIError.invalidArgument('Valid estimatedPrice is required');
    }

    try {
      const result = await db.query(
        `UPDATE buyback_requests 
         SET status = 'approved', estimated_price = $2, updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [id, estimatedPrice]
      );

      if (!result?.rows?.[0]) {
        throw APIError.notFound('Buyback request not found');
      }

      return mapRowToRequest(result.rows[0]);
    } catch (error) {
      if (error instanceof Error && error.message?.includes('not found')) {
        throw error;
      }
      console.error(`Error approving buyback request '${id}':`, error);
      throw APIError.internal('Failed to approve buyback request');
    }
  }
);

/**
 * Reject buyback request (Admin only)
 */
export const rejectBuybackRequest = api(
  {
    expose: true,
    method: 'PUT',
    path: '/buyback/requests/:id/reject',
    auth: true,
  },
  async ({ id }: { id: string }, auth: GetAuthContext): Promise<BuybackRequest> => {
    // Verify admin privilege
    // TODO: Implement proper admin role checking
    // if (!isAdmin(auth)) {
    //   throw APIError.forbidden('Admin access required to reject requests');
    // }

    if (!id || typeof id !== 'string') {
      throw APIError.invalidArgument('Request ID is required');
    }

    try {
      const result = await db.query(
        `UPDATE buyback_requests 
         SET status = 'rejected', updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [id]
      );

      if (!result?.rows?.[0]) {
        throw APIError.notFound('Buyback request not found');
      }

      return mapRowToRequest(result.rows[0]);
    } catch (error) {
      if (error instanceof Error && error.message?.includes('not found')) {
        throw error;
      }
      console.error(`Error rejecting buyback request '${id}':`, error);
      throw APIError.internal('Failed to reject buyback request');
    }
  }
);

// Helper function
function mapRowToRequest(row: any): BuybackRequest {
  if (!row) {
    throw new Error('Cannot map null or undefined row to BuybackRequest');
  }

  return {
    id: row.id || '',
    userId: row.user_id || '',
    productId: row.product_id || '',
    quantity: row.quantity || 0,
    description: row.description || '',
    images: parseImages(row.images),
    status: row.status || 'pending',
    estimatedPrice: row.estimated_price,
    finalPrice: row.final_price,
    createdAt: new Date(row.created_at || Date.now()),
    updatedAt: new Date(row.updated_at || Date.now()),
  };
}
