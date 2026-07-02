import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { getGuestCart, saveGuestCart, GuestCartItem } from "../services/guestCart";
import { fetchProduct } from "../services/productService";
import { Product } from "../types";
import { LoadingState, EmptyState } from "../components/StateViews";

interface GuestLine {
  product: Product;
  quantity: number;
}

export function CartPage() {
  const { user } = useAuthStore();
  const { cart, loading, loadCart, updateItem, removeItem } = useCartStore();
  const navigate = useNavigate();

  const [guestLines, setGuestLines] = useState<GuestLine[]>([]);
  const [guestLoading, setGuestLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadCart(true);
    } else {
      loadGuestLines();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function loadGuestLines() {
    const items = getGuestCart();
    if (items.length === 0) {
      setGuestLines([]);
      return;
    }
    setGuestLoading(true);
    const products = await Promise.all(items.map((i) => fetchProduct(i.productId).catch(() => null)));
    const lines: GuestLine[] = items
      .map((i, idx) => (products[idx] ? { product: products[idx] as Product, quantity: i.quantity } : null))
      .filter((l): l is GuestLine => l !== null);
    setGuestLines(lines);
    setGuestLoading(false);
  }

  function updateGuestQuantity(productId: string, quantity: number) {
    const items: GuestCartItem[] = guestLines.map((l) =>
      l.product._id === productId ? { productId, quantity } : { productId: l.product._id, quantity: l.quantity }
    );
    saveGuestCart(items);
    setGuestLines((prev) => prev.map((l) => (l.product._id === productId ? { ...l, quantity } : l)));
  }

  function removeGuestItem(productId: string) {
    const items = getGuestCart().filter((i) => i.productId !== productId);
    saveGuestCart(items);
    setGuestLines((prev) => prev.filter((l) => l.product._id !== productId));
  }

  if (user) {
    if (loading && !cart) return <LoadingState label="Loading cart..." />;
    if (!cart || cart.items.length === 0) {
      return <EmptyState message="Your cart is empty." action={<Link to="/" className="text-indigo-600">Browse products</Link>} />;
    }

    return (
      <div>
        <h1 className="text-xl font-bold mb-4">Your Cart</h1>
        <div className="space-y-4">
          {cart.items.map((line) =>
            line.product ? (
              <div key={line.product._id} className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg p-3">
                <img
                  src={line.product.images[0] || undefined}
                  className="w-16 h-16 object-cover rounded bg-gray-100"
                  alt={line.product.name}
                />
                <div className="flex-1">
                  <Link to={`/products/${line.product._id}`} className="font-medium hover:text-indigo-600">
                    {line.product.name}
                  </Link>
                  <p className="text-sm text-gray-500">${line.product.price.toFixed(2)} each</p>
                </div>
                <input
                  type="number"
                  min={1}
                  max={line.product.stock}
                  value={line.quantity}
                  onChange={(e) => updateItem(line.product!._id, Math.max(1, Number(e.target.value)))}
                  className="w-16 border border-gray-300 rounded-md px-2 py-1 text-sm"
                />
                <span className="w-20 text-right font-medium">${line.lineTotal.toFixed(2)}</span>
                <button onClick={() => removeItem(line.product!._id)} className="text-red-500 text-sm hover:underline">
                  Remove
                </button>
              </div>
            ) : null
          )}
        </div>

        <div className="flex justify-between items-center mt-6 border-t pt-4">
          <span className="text-lg font-semibold">Subtotal: ${cart.subtotal.toFixed(2)}</span>
          <button
            onClick={() => navigate("/checkout")}
            className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Checkout
          </button>
        </div>
      </div>
    );
  }

  // Guest cart view
  if (guestLoading) return <LoadingState label="Loading cart..." />;
  if (guestLines.length === 0) {
    return <EmptyState message="Your cart is empty." action={<Link to="/" className="text-indigo-600">Browse products</Link>} />;
  }

  const guestSubtotal = guestLines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Your Cart</h1>
      <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mb-4">
        You're browsing as a guest.{" "}
        <Link to="/login" className="underline font-medium">Log in</Link> to save your cart and check out.
      </p>
      <div className="space-y-4">
        {guestLines.map((line) => (
          <div key={line.product._id} className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg p-3">
            <img src={line.product.images[0] || undefined} className="w-16 h-16 object-cover rounded bg-gray-100" alt={line.product.name} />
            <div className="flex-1">
              <Link to={`/products/${line.product._id}`} className="font-medium hover:text-indigo-600">
                {line.product.name}
              </Link>
              <p className="text-sm text-gray-500">${line.product.price.toFixed(2)} each</p>
            </div>
            <input
              type="number"
              min={1}
              max={line.product.stock}
              value={line.quantity}
              onChange={(e) => updateGuestQuantity(line.product._id, Math.max(1, Number(e.target.value)))}
              className="w-16 border border-gray-300 rounded-md px-2 py-1 text-sm"
            />
            <span className="w-20 text-right font-medium">${(line.product.price * line.quantity).toFixed(2)}</span>
            <button onClick={() => removeGuestItem(line.product._id)} className="text-red-500 text-sm hover:underline">
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mt-6 border-t pt-4">
        <span className="text-lg font-semibold">Subtotal: ${guestSubtotal.toFixed(2)}</span>
        <Link to="/login" className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          Log in to checkout
        </Link>
      </div>
    </div>
  );
}
