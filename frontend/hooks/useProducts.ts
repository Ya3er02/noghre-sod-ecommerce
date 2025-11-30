import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Product, ProductFilters, PaginationParams } from '@/lib/types';
import { api } from '@/lib/api';
import { useDebounce } from './useDebounce';

interface UseProductsOptions {
  filters?: ProductFilters;
  pagination?: PaginationParams;
  enabled?: boolean;
}

/**
 * Hook for fetching and managing products
 * Implements best practices from Shopify & luxury e-commerce sites
 */
export function useProducts(options: UseProductsOptions = {}) {
  const { filters, pagination, enabled = true } = options;

  return useQuery({
    queryKey: ['products', filters, pagination],
    queryFn: () => api.products.list({ filters, pagination }),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes - fresh data
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

/**
 * Hook for fetching single product details
 */
export function useProduct(productId: string | undefined) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => {
      if (!productId) throw new Error('Product ID is required');
      return api.products.getById(productId);
    },
    enabled: !!productId,
    staleTime: 10 * 60 * 1000, // 10 minutes for detailed view
    gcTime: 30 * 60 * 1000, // 30 minutes cache
  });
}

/**
 * Hook for featured/recommended products
 */
export function useFeaturedProducts(limit: number = 8) {
  return useQuery({
    queryKey: ['products', 'featured', limit],
    queryFn: () => api.products.getFeatured(limit),
    staleTime: 15 * 60 * 1000, // 15 minutes - changes rarely
    gcTime: 60 * 60 * 1000, // 1 hour cache
  });
}

/**
 * Hook for related products (cross-sell)
 */
export function useRelatedProducts(productId: string, limit: number = 4) {
  return useQuery({
    queryKey: ['products', 'related', productId, limit],
    queryFn: () => api.products.getRelated(productId, limit),
    enabled: !!productId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Hook for product search with debouncing
 */
export function useProductSearch(query: string, debounceMs: number = 300) {
  const debouncedQuery = useDebounce(query, debounceMs);

  return useQuery({
    queryKey: ['products', 'search', debouncedQuery],
    queryFn: () => api.products.search(debouncedQuery),
    enabled: debouncedQuery.length >= 2, // Min 2 chars
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for product categories
 */
export function useProductCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.products.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Hook for adding product to favorites
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => api.favorites.toggle(productId),
    onSuccess: () => {
      // Invalidate favorites list
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}

/**
 * Hook for product review submission
 */
export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (review: { productId: string; rating: number; comment: string }) =>
      api.reviews.submit(review),
    onSuccess: (_, variables) => {
      // Invalidate product and reviews
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.productId] });
    },
  });
}
