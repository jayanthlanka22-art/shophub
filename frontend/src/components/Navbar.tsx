import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useCartItemCount } from "../store/cartStore";

export function Navbar() {
  const { user, logout } = useAuthStore();
  const cartCount = useCartItemCount();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-indigo-600">
          ShopHub
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link to="/" className="hover:text-indigo-600">Products</Link>
          <Link to="/cart" className="relative hover:text-indigo-600">
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <Link to="/orders" className="hover:text-indigo-600">My Orders</Link>
              {user.role === "admin" && (
                <Link to="/admin" className="hover:text-indigo-600">Admin</Link>
              )}
              <span className="text-gray-400">|</span>
              <span className="text-gray-500">Hi, {user.name.split(" ")[0]}</span>
              <button onClick={handleLogout} className="text-gray-500 hover:text-red-600">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-indigo-600">Login</Link>
              <Link
                to="/register"
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
