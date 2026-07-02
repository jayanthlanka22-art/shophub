import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { placeOrderRequest } from "../services/orderService";
import { ShippingAddress } from "../types";
import { LoadingState, EmptyState } from "../components/StateViews";

const emptyAddress: ShippingAddress = {
  fullName: "",
  line1: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  phone: "",
};

export function CheckoutPage() {
  const { cart, loadCart } = useCartStore();
  const navigate = useNavigate();
  const [address, setAddress] = useState<ShippingAddress>(emptyAddress);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCart(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!cart) return <LoadingState label="Loading checkout..." />;
  if (cart.items.length === 0) {
    return <EmptyState message="Your cart is empty — add something before checking out." />;
  }

  function handleChange(field: keyof ShippingAddress, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }));
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const order = await placeOrderRequest(address);
      navigate(`/orders/${order._id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  }

  const fields: { key: keyof ShippingAddress; label: string }[] = [
    { key: "fullName", label: "Full name" },
    { key: "line1", label: "Address line" },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "postalCode", label: "Postal code" },
    { key: "country", label: "Country" },
    { key: "phone", label: "Phone" },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <form onSubmit={handlePlaceOrder} className="space-y-4">
        <h1 className="text-xl font-bold">Shipping Address</h1>
        {fields.map((f) => (
          <div key={f.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
            <input
              required
              value={address[f.key]}
              onChange={(e) => handleChange(f.key, e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
        ))}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <p className="text-xs text-gray-500">
          This is a demo checkout — no real payment is processed. Placing the order simulates payment success.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300"
        >
          {submitting ? "Placing order..." : "Place Order"}
        </button>
      </form>

      <div>
        <h2 className="text-lg font-semibold mb-3">Order Summary</h2>
        <div className="bg-white border border-gray-200 rounded-lg divide-y">
          {cart.items.map((line) =>
            line.product ? (
              <div key={line.product._id} className="flex justify-between p-3 text-sm">
                <span>{line.product.name} × {line.quantity}</span>
                <span className="font-medium">${line.lineTotal.toFixed(2)}</span>
              </div>
            ) : null
          )}
          <div className="flex justify-between p-3 font-semibold">
            <span>Subtotal</span>
            <span>${cart.subtotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
