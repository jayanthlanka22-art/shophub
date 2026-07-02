import { useEffect, useState } from "react";
import { fetchCategories, createCategoryRequest, updateCategoryRequest, deleteCategoryRequest } from "../../services/categoryService";
import { Category } from "../../types";
import { LoadingState, ErrorState, EmptyState } from "../../components/StateViews";

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setStatus("loading");
    fetchCategories()
      .then((data) => {
        setCategories(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(load, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createCategoryRequest(newName);
      setNewName("");
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create category");
    }
  }

  async function handleUpdate(id: string) {
    setError(null);
    try {
      await updateCategoryRequest(id, editingName);
      setEditingId(null);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update category");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category? Products in it will keep a reference to a missing category.")) return;
    await deleteCategoryRequest(id);
    load();
  }

  if (status === "loading") return <LoadingState label="Loading categories..." />;
  if (status === "error") return <ErrorState onRetry={load} message="Couldn't load categories." />;

  return (
    <div className="max-w-lg">
      <form onSubmit={handleCreate} className="flex gap-2 mb-6">
        <input
          required
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700">
          Add
        </button>
      </form>
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {categories.length === 0 ? (
        <EmptyState message="No categories yet." />
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg divide-y">
          {categories.map((c) => (
            <div key={c._id} className="flex items-center justify-between p-3">
              {editingId === c._id ? (
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-sm mr-3"
                  autoFocus
                />
              ) : (
                <span className="text-sm">{c.name}</span>
              )}
              <div className="space-x-3 text-sm">
                {editingId === c._id ? (
                  <>
                    <button onClick={() => handleUpdate(c._id)} className="text-indigo-600 hover:underline">Save</button>
                    <button onClick={() => setEditingId(null)} className="text-gray-500 hover:underline">Cancel</button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(c._id);
                        setEditingName(c.name);
                      }}
                      className="text-indigo-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDelete(c._id)} className="text-red-600 hover:underline">Delete</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
