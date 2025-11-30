import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Product } from '@/lib/types';

export interface CartItem {
  product: Product;
  quantity: number;
  addedAt: Date;
}

interface CartStore {
  items: CartItem[];
  
  // Actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Computed
  getItemCount: () => number;
  getTotal: () => number;
  getSubtotal: () => number;
  getTax: () => number;
  getShipping: () => number;
  hasItem: (productId: string) => boolean;
  getItem: (productId: string) => CartItem | undefined;
}

/**
 * Shopping Cart Store
 * Implements best practices from luxury e-commerce:
 * - Persistent storage
 * - Optimistic updates
 * - Type-safe
 * - Immutable updates
 */
export const useCart = create<CartStore>()(  
  persist(
    immer((set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id
          );

          if (existingItem) {
            // Update quantity if item exists
            existingItem.quantity += quantity;
          } else {
            // Add new item
            state.items.push({
              product,
              quantity,
              addedAt: new Date(),
            });
          }
        });

        // Toast notification
        // toast.success('محصول به سبد خرید اضافه شد');
      },

      removeItem: (productId) => {
        set((state) => {
          state.items = state.items.filter(
            (item) => item.product.id !== productId
          );
        });

        // toast.info('محصول از سبد خرید حذف شد');
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => {
          const item = state.items.find(
            (item) => item.product.id === productId
          );
          if (item) {
            item.quantity = quantity;
          }
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      // Computed values
      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },

      getTax: () => {
        const subtotal = get().getSubtotal();
        return subtotal * 0.09; // 9% tax
      },

      getShipping: () => {
        const subtotal = get().getSubtotal();
        // Free shipping over 5M Toman
        return subtotal > 5000000 ? 0 : 200000;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const tax = get().getTax();
        const shipping = get().getShipping();
        return subtotal + tax + shipping;
      },

      hasItem: (productId) => {
        return get().items.some((item) => item.product.id === productId);
      },

      getItem: (productId) => {
        return get().items.find((item) => item.product.id === productId);
      },
    })),
    {
      name: 'noghre-sood-cart',
      storage: createJSONStorage(() => localStorage),
      // Serialize/deserialize dates properly
      partialize: (state) => ({
        items: state.items.map((item) => ({
          ...item,
          addedAt: item.addedAt.toISOString(),
        })),
      }),
    }
  )
);

/**
 * Hook for cart analytics
 */
export function useCartAnalytics() {
  const cart = useCart();

  return {
    averageItemPrice: cart.items.length > 0 
      ? cart.getSubtotal() / cart.items.length 
      : 0,
    uniqueProducts: cart.items.length,
    totalItems: cart.getItemCount(),
    cartValue: cart.getTotal(),
    abandonmentRisk: cart.items.length > 0 && 
      Date.now() - new Date(cart.items[0].addedAt).getTime() > 30 * 60 * 1000, // 30min
  };
}
