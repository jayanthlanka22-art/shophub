import { useEffect, useState } from "react";
import { fetchDashboardStats } from "../../services/adminService";
import { DashboardStats } from "../../types";
import { LoadingState, ErrorState } from "../../components/StateViews";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");

  const load = () => {
    setStatus("loading");
    fetchDashboardStats()
      .then((d) => {
        setStats(d);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(load, []);

  if (status === "loading") return <LoadingState label="Loading dashboard..." />;
  if (status === "error" || !stats) return <ErrorState onRetry={load} message="Couldn't load dashboard." />;

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString("en-IN")}`} />
        <StatCard label="Total Orders" value={stats.totalOrders} />
        <StatCard label="Total Products" value={stats.totalProducts} />
      </div>

      <h2 className="font-semibold mb-2">Low Stock Alerts (&lt; 5 units)</h2>
      {stats.lowStock.length === 0 ? (
        <p className="text-sm text-gray-500">Nothing is low on stock right now.</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg divide-y">
          {stats.lowStock.map((p) => (
            <div key={p._id} className="flex justify-between p-3 text-sm">
              <span>{p.name}</span>
              <span className="text-red-600 font-medium">{p.stock} left</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
