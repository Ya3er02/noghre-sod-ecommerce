import { api, APIError } from 'encore.dev/api';
import { SQLDatabase } from 'encore.dev/storage/sqldb';
import { getSilverSpot } from '../price/service';
import * as path from 'path';

// Use __dirname to ensure correct path resolution
const db = new SQLDatabase('buyback', {
  migrations: path.join(__dirname, 'migrations'),
});

/**
 * Buyback Service
 * 
 * Implements guaranteed buyback feature:
 * - Calculate buyback price based on current silver spot
 * - Verify product serial number
 * - Create buyback request
 * - Track buyback status
 */

export interface BuybackRequest {
  id: string;
  userId: string;
  productId?: string;
  serialNumber: string;
  weight: number;
  purity: '925' | '999';
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  images: string[];
  estimatedPrice: number;
  finalPrice?: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BuybackCalculation {
  silverValue: number;
  conditionMultiplier: number;
  deductionPercent: number;
  finalPrice: number;
  breakdown: {
    pureSilverWeight: number;
    spotPrice: number;
    conditionAdjustment: number;
    businessDeduction: number;
  };
}

// Wrapper interface for list response (Encore requirement)
export interface BuybackRequestsList {
  requests: BuybackRequest[];
  total: number;
}

/**
 * Calculate Buyback Price
 */
export const calculateBuybackPrice = api(
  { expose: true, method: 'POST', path: '/buyback/calculate' },
  async ({
    weight,
    purity,
    condition = 'good',
  }: {
    weight: number;
    purity: '925' | '999';
    condition?: 'excellent' | 'good' | 'fair' | 'poor';
  }): Promise<BuybackCalculation> => {
    // Get current silver spot price
    const silverPrice = await getSilverSpot();

    // Calculate pure silver content
    const purityMultiplier = purity === '925' ? 0.925 : 0.999;
    const pureSilverGrams = weight * purityMultiplier;

    // Silver value at current spot price
    const silverValue = pureSilverGrams * silverPrice.irt;

    // Condition multiplier
    const conditionMultipliers = {
      excellent: 0.95, // 95% of silver value
      good: 0.90,      // 90% of silver value
      fair: 0.85,      // 85% of silver value
      poor: 0.75,      // 75% of silver value
    };

    const conditionMultiplier = conditionMultipliers[condition];
    const conditionAdjustment = silverValue * (1 - conditionMultiplier);

    // Business deduction (10% for processing, melting, etc.)
    const deductionPercent = 10;
    const businessDeduction = silverValue * (deductionPercent / 100);

    // Final buyback price
    const finalPrice = Math.round(
      (silverValue * conditionMultiplier - businessDeduction) / 1000
    ) * 1000;

    return {
      silverValue,
      conditionMultiplier,
      deductionPercent,
      finalPrice,
      breakdown: {
        pureSilverWeight: pureSilverGrams,
        spotPrice: silverPrice.irt,
        conditionAdjustment,
        businessDeduction,
      },
    };
  }
);

/**
 * Verify Product Serial Number
 */
export const verifySerial = api(
  { expose: true, method: 'GET', path: '/buyback/verify/:serialNumber' },
  async ({ serialNumber }: { serialNumber: string }): Promise<{
    valid: boolean;
    product?: {
      id: string;
      name: string;
      weight: number;
      purity: '925' | '999';
      purchaseDate: Date;
      originalPrice: number;
    };
  }> => {
    // Check if serial number exists in products
    const result = await db.query(
      `SELECT p.*, o.created_at as purchase_date, o.price as original_price
       FROM products p
       LEFT JOIN orders o ON o.product_id = p.id
       WHERE p.serial_number = $1
       ORDER BY o.created_at DESC
       LIMIT 1`,
      [serialNumber]
    );

    if (result.rows.length === 0) {
      return { valid: false };
    }

    const row = result.rows[0];
    return {
      valid: true,
      product: {
        id: row.id,
        name: row.name,
        weight: parseFloat(row.weight),
        purity: row.purity,
        purchaseDate: new Date(row.purchase_date),
        originalPrice: parseFloat(row.original_price),
      },
    };
  }
);

/**
 * Create Buyback Request
 */
export const createRequest = api(
  { expose: true, method: 'POST', path: '/buyback/request', auth: true },
  async (request: {
    serialNumber: string;
    weight: number;
    purity: '925' | '999';
    condition: 'excellent' | 'good' | 'fair' | 'poor';
    images: string[];
  }): Promise<BuybackRequest> => {
    // Verify serial number
    const verification = await verifySerial({ serialNumber: request.serialNumber });

    if (!verification.valid) {
      throw APIError.invalidArgument('Invalid serial number');
    }

    // Calculate estimated price
    const calculation = await calculateBuybackPrice({
      weight: request.weight,
      purity: request.purity,
      condition: request.condition,
    });

    // Create buyback request
    const result = await db.query(
      `INSERT INTO buyback_requests (
        user_id, product_id, serial_number, weight, purity, condition,
        images, estimated_price, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
      RETURNING *`,
      [
        'current-user-id', // TODO: Get from auth context
        verification.product?.id,
        request.serialNumber,
        request.weight,
        request.purity,
        request.condition,
        JSON.stringify(request.images),
        calculation.finalPrice,
      ]
    );

    return mapRowToBuybackRequest(result.rows[0]);
  }
);

/**
 * Get Buyback Request Status
 */
export const getRequest = api(
  { expose: true, method: 'GET', path: '/buyback/request/:id', auth: true },
  async ({ id }: { id: string }): Promise<BuybackRequest> => {
    const result = await db.query(
      'SELECT * FROM buyback_requests WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      throw APIError.notFound('Buyback request not found');
    }

    return mapRowToBuybackRequest(result.rows[0]);
  }
);

/**
 * List User Buyback Requests
 * Fixed: Wrapped array return in interface to satisfy Encore type requirements
 */
export const listRequests = api(
  { expose: true, method: 'GET', path: '/buyback/requests', auth: true },
  async (): Promise<BuybackRequestsList> => {
    const result = await db.query(
      `SELECT * FROM buyback_requests 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      ['current-user-id'] // TODO: Get from auth context
    );

    const requests = result.rows.map(mapRowToBuybackRequest);

    return {
      requests,
      total: requests.length,
    };
  }
);

// Helper function
function mapRowToBuybackRequest(row: any): BuybackRequest {
  return {
    id: row.id,
    userId: row.user_id,
    productId: row.product_id,
    serialNumber: row.serial_number,
    weight: parseFloat(row.weight),
    purity: row.purity,
    condition: row.condition,
    images: typeof row.images === 'string' ? JSON.parse(row.images) : row.images,
    estimatedPrice: parseFloat(row.estimated_price),
    finalPrice: row.final_price ? parseFloat(row.final_price) : undefined,
    status: row.status,
    rejectionReason: row.rejection_reason,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
