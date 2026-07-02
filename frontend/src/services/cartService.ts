import { api } from "./api";
import { ApiResponse, Cart } from "../types";

export async function fetchCart() {
  const res = await api.get<ApiResponse<Cart>>("/cart");
  return res.data.data;
}

export async function addCartItemRequest(productId: string, quantity: number) {
  const res = await api.post<ApiResponse<Cart>>("/cart/items", { productId, quantity });
  return res.data.data;
}

export async function updateCartItemRequest(productId: string, quantity: number) {
  const res = await api.put<ApiResponse<Cart>>(`/cart/items/${productId}`, { quantity });
  return res.data.data;
}

export async function removeCartItemRequest(productId: string) {
  const res = await api.delete<ApiResponse<Cart>>(`/cart/items/${productId}`);
  return res.data.data;
}

export async function mergeGuestCartRequest(items: { productId: string; quantity: number }[]) {
  const res = await api.post<ApiResponse<Cart>>("/cart/merge", { items });
  return res.data.data;
}
