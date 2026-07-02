import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { isProd } from "../config/env";

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}`, errors: null });
}

// Must be registered last, and must have 4 args for Express to recognize it as
// error-handling middleware.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  const message = err instanceof Error ? err.message : "Internal server error";
  if (!isProd) {
    console.error(err);
  }

  res.status(500).json({
    success: false,
    message: isProd ? "Internal server error" : message,
    errors: isProd || !(err instanceof Error) ? null : { stack: err.stack },
  });
}
