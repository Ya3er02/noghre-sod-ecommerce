import { api, APIError } from 'encore.dev/api';
import { SQLDatabase } from 'encore.dev/storage/sqldb';
import * as path from 'path';

// Database connection
const db = new SQLDatabase('buyback', {
  migrations: path.join(__dirname, 'migrations'),
});

export interface CreateBuybackRequestInput {
  userId: string;
  productId: string;
  quantity: number;
  description: string;
  images?: string[];
}

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

/**
 * Safely parse JSON string to array
 * Returns empty array on parse failure or non-array result
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
 * Create Buyback Request
 */
export const createBuybackRequest = api(
  {
    expose: true,
    method: 'POST',
    path: '/buyback/requests/create',
    auth: true,
  },
  async (input: CreateBuybackRequestInput): Promise<BuybackRequest> => {
    // Validate required fields
    if (!input.userId || !input.productId || !input.quantity) {
      throw APIError.invalidArgument(
        'userId, productId, and quantity are required'
      );
    }

    try {
      const result = await db.query(
        `INSERT INTO buyback_requests (
          user_id, product_id, quantity, description, images, status
        ) VALUES ($1, $2, $3, $4, $5, 'pending')
        RETURNING *`,
        [
          input.userId,
          input.productId,
          input.quantity,
          input.description,
          JSON.stringify(input.images || []),
        ]
      );

      // Validate insert result
      if (!result || !Array.isArray(result.rows) || result.rows.length === 0) {
        throw new Error('Failed to create buyback request - no row returned');
      }

      return mapRowToRequest(result.rows[0]);
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          `Error creating buyback request for user '${input.userId}' and product '${input.productId}':`,
          error.message
        );
      }
      throw APIError.internal('Failed to create buyback request');
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
