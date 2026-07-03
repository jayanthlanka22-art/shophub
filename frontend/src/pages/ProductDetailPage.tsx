import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProduct } from "../services/productService";
import { Product } from "../types";
import { LoadingState, ErrorState } from "../components/StateViews";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addItem } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const load = () => {
    if (!id) return;
    setStatus("loading");
    fetchProduct(id)
      .then((p) => {
        setProduct(p);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(load, [id]);

  async function handleAddToCart() {
    if (!product) return;
    await addItem(product._id, quantity, !!user);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  if (status === "loading") return <LoadingState label="Loading product..." />;
  if (status === "error" || !product) return <ErrorState onRetry={load} message="Couldn't load this product." />;

  const outOfStock = product.stock <= 0;
  const categoryName = typeof product.category === "string" ? "" : product.category.name;

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
        {product.images[0] ? (
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
        )}
      </div>

      <div>
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-indigo-600 mb-3">
          ← Back
        </button>
        {categoryName && <span className="text-xs text-gray-400">{categoryName}</span>}
        <h1 className="text-2xl font-bold text-gray-900 mt-1">{product.name}</h1>
        <p className="text-2xl font-semibold text-indigo-600 mt-3">₹{product.price.toLocaleString("en-IN")}</p>
        <p className="text-gray-600 mt-4 leading-relaxed">{product.description}</p>

        <p className="mt-4 text-sm">
          {outOfStock ? (
            <span className="text-red-500 font-medium">Out of stock</span>
          ) : (
            <span className="text-green-600">{product.stock} in stock</span>
          )}
        </p>

        <div className="flex items-center gap-3 mt-5">
          <input
            type="number"
            min={1}
            max={Math.max(product.stock, 1)}
            value={quantity}
            disabled={outOfStock}
            onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value))))}
            className="w-20 border border-gray-300 rounded-md px-2 py-2 text-sm disabled:bg-gray-100"
          />
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {added ? "Added ✓" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
