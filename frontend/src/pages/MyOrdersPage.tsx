import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMyOrders } from "../services/orderService";
import { Order } from "../types";
import { LoadingState, ErrorState, EmptyState } from "../components/StateViews";
import { OrderStatusBadge } from "../components/OrderStatusBadge";

export function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");

  const load = () => {
    setStatus("loading");
    fetchMyOrders()
      .then((data) => {
        setOrders(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(load, []);

  if (status === "loading") return <LoadingState label="Loading orders..." />;
  if (status === "error") return <ErrorState onRetry={load} message="Couldn't load your orders." />;
  if (orders.length === 0) {
    return <EmptyState message="You haven't placed any orders yet." action={<Link to="/" className="text-indigo-600">Start shopping</Link>} />;
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">My Orders</h1>
      <div className="space-y-3">
        {orders.map((o) => (
          <Link
            key={o._id}
            to={`/orders/${o._id}`}
            className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Order #{o._id.slice(-8).toUpperCase()}</p>
                <p className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleDateString()} · {o.items.length} item(s)</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">${o.totalAmount.toFixed(2)}</span>
                <OrderStatusBadge status={o.status} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
