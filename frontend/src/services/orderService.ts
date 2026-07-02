import { api } from "./api";
import { ApiResponse, Order, OrderStatus, ShippingAddress } from "../types";

export async function placeOrderRequest(shippingAddress: ShippingAddress) {
  const res = await api.post<ApiResponse<Order>>("/orders", { shippingAddress });
  return res.data.data;
}

export async function fetchMyOrders() {
  const res = await api.get<ApiResponse<Order[]>>("/orders/my");
  return res.data.data;
}

export async function fetchMyOrder(id: string) {
  const res = await api.get<ApiResponse<Order>>(`/orders/my/${id}`);
  return res.data.data;
}

export async function fetchAllOrders(status?: OrderStatus) {
  const res = await api.get<ApiResponse<Order[]>>("/orders", { params: status ? { status } : {} });
  return res.data.data;
}

export async function updateOrderStatusRequest(id: string, status: OrderStatus) {
  const res = await api.put<ApiResponse<Order>>(`/orders/${id}/status`, { status });
  return res.data.data;
}
