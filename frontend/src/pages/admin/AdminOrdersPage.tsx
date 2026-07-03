import { useEffect, useState } from "react";
import { fetchAllOrders, updateOrderStatusRequest } from "../../services/orderService";
import { Order, OrderStatus } from "../../types";
import { LoadingState, ErrorState, EmptyState } from "../../components/StateViews";
import { OrderStatusBadge } from "../../components/OrderStatusBadge";
import { ORDER_STATUS_TRANSITIONS } from "../../utils/orderStatus";

const STATUS_FILTERS: (OrderStatus | "all")[] = ["all", "pending", "processing", "shipped", "delivered", "cancelled"];

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = () => {
    setStatus("loading");
    fetchAllOrders(filter === "all" ? undefined : filter)
      .then((data) => {
        setOrders(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(load, [filter]);

  async function handleStatusChange(id: string, nextStatus: OrderStatus) {
    setUpdatingId(id);
    try {
      await updateOrderStatusRequest(id, nextStatus);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-sm capitalize ${
              filter === f ? "bg-indigo-600 text-white" : "bg-white border border-gray-300 text-gray-600"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {status === "loading" && <LoadingState label="Loading orders..." />}
      {status === "error" && <ErrorState onRetry={load} message="Couldn't load orders." />}
      {status === "ready" && orders.length === 0 && <EmptyState message="No orders found." />}

      {status === "ready" && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((o) => {
            const userInfo = typeof o.user === "string" ? null : o.user;
            const nextOptions = ORDER_STATUS_TRANSITIONS[o.status];
            return (
              <div key={o._id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Order #{o._id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-gray-500">
                      {userInfo ? `${userInfo.name} (${userInfo.email})` : "Unknown user"} · {new Date(o.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">₹{o.totalAmount.toLocaleString("en-IN")}</span>
                    <OrderStatusBadge status={o.status} />
                  </div>
                </div>
                {nextOptions.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {nextOptions.map((next) => (
                      <button
                        key={next}
                        disabled={updatingId === o._id}
                        onClick={() => handleStatusChange(o._id, next)}
                        className="px-3 py-1 text-xs rounded-md border border-gray-300 hover:bg-gray-50 capitalize disabled:opacity-50"
                      >
                        Mark {next}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
