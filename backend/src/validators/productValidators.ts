import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

export const createProductSchema = z.object({
  name: z.string().min(2).max(160),
  description: z.string().min(1).max(5000),
  price: z.number().nonnegative(),
  category: objectId,
  stock: z.number().int().nonnegative(),
  images: z.array(z.string().url()).default([]),
});

export const updateProductSchema = createProductSchema.partial();
