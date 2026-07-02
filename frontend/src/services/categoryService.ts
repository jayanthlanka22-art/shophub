import { api } from "./api";
import { ApiResponse, Category } from "../types";

export async function fetchCategories() {
  const res = await api.get<ApiResponse<Category[]>>("/categories");
  return res.data.data;
}

export async function createCategoryRequest(name: string) {
  const res = await api.post<ApiResponse<Category>>("/categories", { name });
  return res.data.data;
}

export async function updateCategoryRequest(id: string, name: string) {
  const res = await api.put<ApiResponse<Category>>(`/categories/${id}`, { name });
  return res.data.data;
}

export async function deleteCategoryRequest(id: string) {
  await api.delete(`/categories/${id}`);
}
