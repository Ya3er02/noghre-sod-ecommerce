// Encore.dev Type Definitions for Product Service
// All types must be exportable and serializable

export interface Product {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  price: number;
  originalPrice?: number;
  weight: number; // grams
  purity: '925' | '999';
  serialNumber: string;
  category: string;
  images: string[];
  inStock: boolean;
  isNew: boolean;
  isFeatured: boolean;
  discount?: number;
  rating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Query parameters must be simple types (no nested objects)
export interface ProductFilterParams {
  categories?: string; // comma-separated
  purities?: string; // comma-separated
  minPrice?: number;
  maxPrice?: number;
  minWeight?: number;
  maxWeight?: number;
  inStock?: boolean;
  onSale?: boolean;
  sortBy?: string; // 'newest' | 'price-asc' | 'price-desc' | 'popular' | 'weight'
  page?: number;
  limit?: number;
}

export interface ProductListResponse {
  products: Product[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface ProductsResponse {
  products: Product[];
  count: number;
}

export interface Category {
  name: string;
  count: number;
}

export interface CategoryResponse {
  categories: Category[];
  total: number;
}
