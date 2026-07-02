import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

export const addCartItemSchema = z.object({
  productId: objectId,
  quantity: z.number().int().positive().default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive(),
});

export const mergeGuestCartSchema = z.object({
  items: z.array(
    z.object({
      productId: objectId,
      quantity: z.number().int().positive(),
    })
  ),
});
