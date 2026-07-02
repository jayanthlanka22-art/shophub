import { OrderStatus } from "../types";

// Mirrors backend/src/models/Order.ts ORDER_STATUS_TRANSITIONS. Used to only
// show valid "mark as..." actions to the admin — the backend still enforces this.
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};
