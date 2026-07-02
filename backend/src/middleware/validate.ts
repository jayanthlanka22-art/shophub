import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { ApiError } from "../utils/ApiError";

// Validates req.body against the given Zod schema and replaces req.body with
// the parsed (typed, defaulted) result.
export function validateBody(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(new ApiError(400, "Validation failed", err.flatten()));
      } else {
        next(err);
      }
    }
  };
}
