import { api } from "./api";
import { ApiResponse, DashboardStats, User } from "../types";

export async function fetchDashboardStats() {
  const res = await api.get<ApiResponse<DashboardStats>>("/admin/dashboard");
  return res.data.data;
}

export async function fetchAllUsers() {
  const res = await api.get<ApiResponse<User[]>>("/admin/users");
  return res.data.data;
}
