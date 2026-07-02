import { create } from "zustand";
import { User } from "../types";
import { loginRequest, logoutRequest, registerRequest, getMeRequest } from "../services/authService";

interface AuthState {
  user: User | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
  error: string | null;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "idle",
  error: null,

  // Called once on app load to check for an existing session via the httpOnly cookie.
  init: async () => {
    set({ status: "loading" });
    try {
      const user = await getMeRequest();
      set({ user, status: "authenticated" });
    } catch {
      set({ user: null, status: "unauthenticated" });
    }
  },

  login: async (email, password) => {
    set({ error: null });
    try {
      const user = await loginRequest(email, password);
      set({ user, status: "authenticated" });
    } catch (err: any) {
      set({ error: err?.response?.data?.message || "Login failed" });
      throw err;
    }
  },

  register: async (name, email, password) => {
    set({ error: null });
    try {
      const user = await registerRequest(name, email, password);
      set({ user, status: "authenticated" });
    } catch (err: any) {
      set({ error: err?.response?.data?.message || "Registration failed" });
      throw err;
    }
  },

  logout: async () => {
    await logoutRequest();
    set({ user: null, status: "unauthenticated" });
  },

  clearError: () => set({ error: null }),
}));
