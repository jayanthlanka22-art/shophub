import { OrderStatus } from "../types";

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}
