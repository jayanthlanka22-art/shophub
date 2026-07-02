import { Link } from "react-router-dom";
import { Product } from "../types";

export function ProductCard({ product }: { product: Product }) {
  const outOfStock = product.stock <= 0;
  const categoryName = typeof product.category === "string" ? "" : product.category.name;

  return (
    <Link
      to={`/products/${product._id}`}
      className="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white flex flex-col"
    >
      <div className="aspect-square bg-gray-100 overflow-hidden">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col">
        {categoryName && <span className="text-xs text-gray-400 mb-1">{categoryName}</span>}
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">{product.name}</h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-semibold text-gray-900">${product.price.toFixed(2)}</span>
          {outOfStock ? (
            <span className="text-xs text-red-500 font-medium">Out of stock</span>
          ) : (
            <span className="text-xs text-green-600">In stock</span>
          )}
        </div>
      </div>
    </Link>
  );
}
