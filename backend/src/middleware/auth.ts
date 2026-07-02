import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { verifyAccessToken } from "../utils/tokens";
import { UserRole } from "../models/User";

export interface AuthedRequest extends Request {
  user?: { id: string; role: UserRole };
}

export function authenticate(req: AuthedRequest, _res: Response, next: NextFunction): void {
  const token = req.cookies?.accessToken;
  if (!token) {
    return next(new ApiError(401, "Not authenticated"));
  }
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired access token"));
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: AuthedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ApiError(401, "Not authenticated"));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "Forbidden: insufficient role"));
    }
    next();
  };
}
