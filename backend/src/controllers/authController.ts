import { Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  expiryToMs,
} from "../utils/tokens";
import { env, isProd } from "../config/env";
import { AuthedRequest } from "../middleware/auth";

const SALT_ROUNDS = 10;

function setAuthCookies(res: Response, userId: string, role: "admin" | "user") {
  const accessToken = signAccessToken({ sub: userId, role });
  const refreshToken = signRefreshToken({ sub: userId });

  const cookieOpts = {
    httpOnly: true,
    secure: isProd,
    // Frontend and backend live on different domains in production (e.g. Vercel + Render),
    // which makes every request cross-site — cookies need sameSite: "none" for that, and
    // "none" requires secure: true. Locally, same-site "lax" is fine (same domain, different port).
    sameSite: (isProd ? "none" : "lax") as "none" | "lax",
  };

  res.cookie("accessToken", accessToken, {
    ...cookieOpts,
    maxAge: expiryToMs(env.JWT_ACCESS_EXPIRES_IN),
  });
  res.cookie("refreshToken", refreshToken, {
    ...cookieOpts,
    maxAge: expiryToMs(env.JWT_REFRESH_EXPIRES_IN),
    path: "/api/auth",
  });
}

export const register = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  // Role is always 'user' at public registration — never accepted from the client.
  const user = await User.create({ name, email, passwordHash, role: "user" });

  setAuthCookies(res, user._id.toString(), user.role);

  res.status(201).json({
    success: true,
    message: "Registered successfully",
    errors: null,
    data: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

export const login = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new ApiError(401, "Invalid email or password");
  }

  setAuthCookies(res, user._id.toString(), user.role);

  res.json({
    success: true,
    message: "Logged in successfully",
    errors: null,
    data: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

export const refresh = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    throw new ApiError(401, "No refresh token provided");
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    throw new ApiError(401, "User no longer exists");
  }

  setAuthCookies(res, user._id.toString(), user.role);

  res.json({ success: true, message: "Token refreshed", errors: null, data: null });
});

export const logout = asyncHandler(async (_req: AuthedRequest, res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken", { path: "/api/auth" });
  res.json({ success: true, message: "Logged out", errors: null, data: null });
});

export const getMe = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const user = await User.findById(req.user!.id).select("-passwordHash");
  if (!user) throw new ApiError(404, "User not found");
  res.json({ success: true, message: "OK", errors: null, data: user });
});
