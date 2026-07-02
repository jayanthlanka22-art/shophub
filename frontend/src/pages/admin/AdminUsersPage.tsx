import { useEffect, useState } from "react";
import { fetchAllUsers } from "../../services/adminService";
import { User } from "../../types";
import { LoadingState, ErrorState, EmptyState } from "../../components/StateViews";

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");

  const load = () => {
    setStatus("loading");
    fetchAllUsers()
      .then((data) => {
        setUsers(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(load, []);

  if (status === "loading") return <LoadingState label="Loading users..." />;
  if (status === "error") return <ErrorState onRetry={load} message="Couldn't load users." />;
  if (users.length === 0) return <EmptyState message="No users registered yet." />;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-500">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Role</th>
            <th className="p-3">Joined</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {users.map((u) => (
            <tr key={u._id}>
              <td className="p-3">{u.name}</td>
              <td className="p-3 text-gray-500">{u.email}</td>
              <td className="p-3">
                <span className={`text-xs px-2 py-1 rounded-full ${u.role === "admin" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"}`}>
                  {u.role}
                </span>
              </td>
              <td className="p-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
