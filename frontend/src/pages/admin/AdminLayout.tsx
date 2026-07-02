import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/users", label: "Users" },
];

export function AdminLayout() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Admin Panel</h1>
      <div className="flex gap-2 border-b border-gray-200 mb-6">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `px-3 py-2 text-sm font-medium border-b-2 -mb-px ${
                isActive ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-800"
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  );
}
