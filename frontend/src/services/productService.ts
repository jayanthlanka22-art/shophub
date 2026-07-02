import { api } from "./api";
import { ApiResponse, Product, ProductListResponse } from "../types";

export interface ProductQuery {
  page?: number;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "price_asc" | "price_desc" | "newest";
  search?: string;
}

export async function fetchProducts(query: ProductQuery) {
  const res = await api.get<ApiResponse<ProductListResponse>>("/products", { params: query });
  return res.data.data;
}

export async function fetchProduct(id: string) {
  const res = await api.get<ApiResponse<Product>>(`/products/${id}`);
  return res.data.data;
}

export interface ProductPayload {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
}

export async function createProductRequest(payload: ProductPayload) {
  const res = await api.post<ApiResponse<Product>>("/products", payload);
  return res.data.data;
}

export async function updateProductRequest(id: string, payload: Partial<ProductPayload>) {
  const res = await api.put<ApiResponse<Product>>(`/products/${id}`, payload);
  return res.data.data;
}

export async function deleteProductRequest(id: string) {
  await api.delete(`/products/${id}`);
}
