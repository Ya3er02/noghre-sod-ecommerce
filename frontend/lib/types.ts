/**
 * Frontend types file
 * Re-exports types from backend to ensure consistency
 */

// Re-export Product types from backend
export type {
  Product,
  ProductImage,
  StockStatus,
  CreateProductRequest,
  UpdateProductRequest,
} from '../../backend/product/types';

// Frontend-specific types can be added here
export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'customer' | 'admin';
}

export interface CartItem {
  productId: string;
  quantity: number;
  addedAt: Date;
}
