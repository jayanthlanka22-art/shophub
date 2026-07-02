import { create } from "zustand";
import { Cart } from "../types";
import {
  fetchCart,
  addCartItemRequest,
  updateCartItemRequest,
  removeCartItemRequest,
  mergeGuestCartRequest,
} from "../services/cartService";
import { getGuestCart, addToGuestCart, clearGuestCart } from "../services/guestCart";

interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  loadCart: (isAuthenticated: boolean) => Promise<void>;
  addItem: (productId: string, quantity: number, isAuthenticated: boolean) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  mergeGuestCartOnLogin: () => Promise<void>;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  loading: false,
  error: null,

  loadCart: async (isAuthenticated) => {
    if (!isAuthenticated) return; // guest cart is read directly from localStorage by the UI
    set({ loading: true, error: null });
    try {
      const cart = await fetchCart();
      set({ cart, loading: false });
    } catch (err: any) {
      set({ error: err?.response?.data?.message || "Failed to load cart", loading: false });
    }
  },

  addItem: async (productId, quantity, isAuthenticated) => {
    if (!isAuthenticated) {
      addToGuestCart(productId, quantity);
      return;
    }
    set({ error: null });
    try {
      const cart = await addCartItemRequest(productId, quantity);
      set({ cart });
    } catch (err: any) {
      set({ error: err?.response?.data?.message || "Failed to add item" });
      throw err;
    }
  },

  updateItem: async (productId, quantity) => {
    try {
      const cart = await updateCartItemRequest(productId, quantity);
      set({ cart });
    } catch (err: any) {
      set({ error: err?.response?.data?.message || "Failed to update item" });
      throw err;
    }
  },

  removeItem: async (productId) => {
    try {
      const cart = await removeCartItemRequest(productId);
      set({ cart });
    } catch (err: any) {
      set({ error: err?.response?.data?.message || "Failed to remove item" });
      throw err;
    }
  },

  // Called right after login/register: pushes any guest-cart items into the
  // user's server-side cart, then clears localStorage and reloads.
  mergeGuestCartOnLogin: async () => {
    const guestItems = getGuestCart();
    if (guestItems.length === 0) {
      const cart = await fetchCart();
      set({ cart });
      return;
    }
    const cart = await mergeGuestCartRequest(guestItems);
    clearGuestCart();
    set({ cart });
  },
}));

// Convenience selector used by the Navbar badge.
export function useCartItemCount(): number {
  const cart = useCartStore((s) => s.cart);
  if (cart) return cart.items.reduce((sum, i) => sum + i.quantity, 0);
  return getGuestCart().reduce((sum, i) => sum + i.quantity, 0);
}
