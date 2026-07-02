import { api } from "./api";
import { ApiResponse, User } from "../types";

export async function registerRequest(name: string, email: string, password: string) {
  const res = await api.post<ApiResponse<User>>("/auth/register", { name, email, password });
  return res.data.data;
}

export async function loginRequest(email: string, password: string) {
  const res = await api.post<ApiResponse<User>>("/auth/login", { email, password });
  return res.data.data;
}

export async function logoutRequest() {
  await api.post("/auth/logout");
}

export async function getMeRequest() {
  const res = await api.get<ApiResponse<User>>("/auth/me");
  return res.data.data;
}
