import { Response } from "express";
import { Cart } from "../models/Cart";
import { Product } from "../models/Product";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { AuthedRequest } from "../middleware/auth";

async function getOrCreateCart(userId: string) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
}

// Builds the cart response with live product data (current price/stock) joined in,
// so the frontend always reflects up-to-date pricing/availability.
async function hydrateCart(cart: InstanceType<typeof Cart>) {
  const productIds = cart.items.map((i) => i.product);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const items = cart.items.map((item) => {
    const product = productMap.get(item.product.toString());
    return {
      product: product ?? null,
      quantity: item.quantity,
      lineTotal: product ? product.price * item.quantity : 0,
    };
  });

  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  return { _id: cart._id, items, subtotal };
}

export const getCart = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const cart = await getOrCreateCart(req.user!.id);
  res.json({ success: true, message: "OK", errors: null, data: await hydrateCart(cart) });
});

export const addCartItem = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { productId, quantity } = req.body;

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");
  if (product.stock < quantity) throw new ApiError(400, "Insufficient stock");

  const cart = await getOrCreateCart(req.user!.id);
  const existing = cart.items.find((i) => i.product.toString() === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ product: product._id, quantity });
  }
  await cart.save();

  res.json({ success: true, message: "Item added to cart", errors: null, data: await hydrateCart(cart) });
});

export const updateCartItem = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");
  if (product.stock < quantity) throw new ApiError(400, "Insufficient stock");

  const cart = await getOrCreateCart(req.user!.id);
  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) throw new ApiError(404, "Item not in cart");

  item.quantity = quantity;
  await cart.save();

  res.json({ success: true, message: "Cart updated", errors: null, data: await hydrateCart(cart) });
});

export const removeCartItem = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { productId } = req.params;
  const cart = await getOrCreateCart(req.user!.id);
  cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  await cart.save();

  res.json({ success: true, message: "Item removed", errors: null, data: await hydrateCart(cart) });
});

// Merges a guest (localStorage) cart into the user's server-side cart on login.
export const mergeGuestCart = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { items } = req.body as { items: { productId: string; quantity: number }[] };
  const cart = await getOrCreateCart(req.user!.id);

  for (const guestItem of items) {
    const existing = cart.items.find((i) => i.product.toString() === guestItem.productId);
    if (existing) {
      existing.quantity += guestItem.quantity;
    } else {
      cart.items.push({ product: guestItem.productId as any, quantity: guestItem.quantity });
    }
  }
  await cart.save();

  res.json({ success: true, message: "Guest cart merged", errors: null, data: await hydrateCart(cart) });
});
