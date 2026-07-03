import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchMyOrder } from "../services/orderService";
import { Order } from "../types";
import { LoadingState, ErrorState } from "../components/StateViews";
import { OrderStatusBadge } from "../components/OrderStatusBadge";

const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"] as const;

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");

  const load = () => {
    if (!id) return;
    setStatus("loading");
    fetchMyOrder(id)
      .then((o) => {
        setOrder(o);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(load, [id]);

  if (status === "loading") return <LoadingState label="Loading order..." />;
  if (status === "error" || !order) return <ErrorState onRetry={load} message="Couldn't load this order." />;

  const currentStepIndex = STATUS_STEPS.indexOf(order.status as any);

  return (
    <div className="max-w-2xl">
      <Link to="/orders" className="text-sm text-gray-500 hover:text-indigo-600 mb-3 inline-block">
        ← Back to orders
      </Link>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-xl font-bold">Order #{order._id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {order.status !== "cancelled" && (
        <div className="flex items-center mb-8">
          {STATUS_STEPS.map((step, idx) => (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  idx <= currentStepIndex ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {idx + 1}
              </div>
              {idx < STATUS_STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 ${idx < currentStepIndex ? "bg-indigo-600" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
      )}

      <h2 className="font-semibold mb-2">Items</h2>
      <div className="bg-white border border-gray-200 rounded-lg divide-y mb-6">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between p-3 text-sm">
            <span>{item.name} × {item.quantity}</span>
            <span className="font-medium">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
          </div>
        ))}
        <div className="flex justify-between p-3 font-semibold">
          <span>Total</span>
          <span>₹{order.totalAmount.toLocaleString("en-IN")}</span>
        </div>
      </div>

      <h2 className="font-semibold mb-2">Shipping Address</h2>
      <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-700 leading-relaxed">
        {order.shippingAddress.fullName}<br />
        {order.shippingAddress.line1}<br />
        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
        {order.shippingAddress.country}<br />
        {order.shippingAddress.phone}
      </div>
    </div>
  );
}
