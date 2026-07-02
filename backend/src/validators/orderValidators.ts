import { z } from "zod";

export const placeOrderSchema = z.object({
  shippingAddress: z.object({
    fullName: z.string().min(2),
    line1: z.string().min(2),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
    phone: z.string().min(5),
  }),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
});
