export type StockStatus = "IN_STOCK" | "OUT_OF_STOCK" | "PRE_ORDER";

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  weightG: number;
  fineness: number;
  dimensions?: string;
  basePriceIrr: number;
  premiumPercent: number;
  useLivePrice: boolean;
  stockStatus: StockStatus;
  stockCount: number;
  categoryId: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  images: ProductImage[];
  currentPriceIrr?: number;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText?: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface CreateProductRequest {
  sku: string;
  name: string;
  slug: string;
  description: string;
  weightG: number;
  fineness: number;
  dimensions?: string;
  basePriceIrr: number;
  premiumPercent?: number;
  useLivePrice?: boolean;
  stockStatus?: StockStatus;
  stockCount?: number;
  categoryId: string;
  isFeatured?: boolean;
  images?: Array<{
    url: string;
    altText?: string;
    sortOrder?: number;
    isPrimary?: boolean;
  }>;
}

export interface UpdateProductRequest {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  weightG?: number;
  fineness?: number;
  dimensions?: string;
  basePriceIrr?: number;
  premiumPercent?: number;
  useLivePrice?: boolean;
  stockStatus?: StockStatus;
  stockCount?: number;
  categoryId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}
