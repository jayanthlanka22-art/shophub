import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { LoadingState } from "./StateViews";

export function ProtectedRoute() {
  const { user, status } = useAuthStore();

  if (status === "idle" || status === "loading") return <LoadingState label="Checking session..." />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function AdminRoute() {
  const { user, status } = useAuthStore();

  if (status === "idle" || status === "loading") return <LoadingState label="Checking session..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return <Outlet />;
}
