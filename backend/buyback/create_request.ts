import { api } from 'encore.dev/api';
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
