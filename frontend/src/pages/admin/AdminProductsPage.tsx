import { useEffect, useState } from "react";
import { fetchProducts, createProductRequest, updateProductRequest, deleteProductRequest, ProductPayload } from "../../services/productService";
import { fetchCategories } from "../../services/categoryService";
import { Product, Category } from "../../types";
import { LoadingState, ErrorState, EmptyState } from "../../components/StateViews";
import { ProductFormModal } from "./ProductFormModal";

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [editing, setEditing] = useState<Product | null | undefined>(undefined); // undefined = closed

  const load = async () => {
    setStatus("loading");
    try {
      const [productData, categoryData] = await Promise.all([
        fetchProducts({ limit: 100 }),
        fetchCategories(),
      ]);
      setProducts(productData.items);
      setCategories(categoryData);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
  }, []);

  async function handleSave(payload: ProductPayload) {
    if (editing) {
      await updateProductRequest(editing._id, payload);
    } else {
      await createProductRequest(payload);
    }
    setEditing(undefined);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    await deleteProductRequest(id);
    load();
  }

  if (status === "loading") return <LoadingState label="Loading products..." />;
  if (status === "error") return <ErrorState onRetry={load} message="Couldn't load products." />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">Products ({products.length})</h2>
        {categories.length === 0 ? (
          <p className="text-sm text-amber-600">Add a category first before creating products.</p>
        ) : (
          <button
            onClick={() => setEditing(null)}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
          >
            + New Product
          </button>
        )}
      </div>

      {products.length === 0 ? (
        <EmptyState message="No products yet." />
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((p) => (
                <tr key={p._id}>
                  <td className="p-3">{p.name}</td>
                  <td className="p-3 text-gray-500">{typeof p.category === "string" ? "" : p.category.name}</td>
                  <td className="p-3">₹{p.price.toLocaleString("en-IN")}</td>
                  <td className="p-3">
                    <span className={p.stock < 5 ? "text-red-600 font-medium" : ""}>{p.stock}</span>
                  </td>
                  <td className="p-3 text-right space-x-3">
                    <button onClick={() => setEditing(p)} className="text-indigo-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(p._id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing !== undefined && (
        <ProductFormModal
          product={editing}
          categories={categories}
          onCancel={() => setEditing(undefined)}
          onSubmit={handleSave}
        />
      )}
    </div>
  );
}
