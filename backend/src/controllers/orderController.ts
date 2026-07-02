import { Response } from "express";
import { Cart } from "../models/Cart";
import { Product } from "../models/Product";
import { Order, ORDER_STATUS_TRANSITIONS } from "../models/Order";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { AuthedRequest } from "../middleware/auth";

// Places an order from the user's current server-side cart: validates stock,
// snapshots product name/price at time of purchase, decrements stock, clears cart.
export const placeOrder = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { shippingAddress } = req.body;
  const userId = req.user!.id;

  const cart = await Cart.findOne({ user: userId });
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  const productIds = cart.items.map((i) => i.product);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const orderItems = [];
  let totalAmount = 0;

  for (const item of cart.items) {
    const product = productMap.get(item.product.toString());
    if (!product) throw new ApiError(400, "One or more products no longer exist");
    if (product.stock < item.quantity) {
      throw new ApiError(400, `Insufficient stock for ${product.name}`);
    }
    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
    });
    totalAmount += product.price * item.quantity;
  }

  // Decrement stock for each product. (A transaction would be used with a replica-set
  // MongoDB deployment; guarded sequential updates here keep this runnable on standalone Mongo too.)
  for (const item of cart.items) {
    await Product.updateOne(
      { _id: item.product, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } }
    );
  }

  const order = await Order.create({
    user: userId,
    items: orderItems,
    shippingAddress,
    totalAmount,
    status: "pending",
  });

  cart.items = [];
  await cart.save();

  res.status(201).json({ success: true, message: "Order placed", errors: null, data: order });
});

export const getMyOrders = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const orders = await Order.find({ user: req.user!.id }).sort({ createdAt: -1 });
  res.json({ success: true, message: "OK", errors: null, data: orders });
});

export const getMyOrderById = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user!.id });
  if (!order) throw new ApiError(404, "Order not found");
  res.json({ success: true, message: "OK", errors: null, data: order });
});

export const getAllOrders = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { status } = req.query;
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;

  const orders = await Order.find(filter).populate("user", "name email").sort({ createdAt: -1 });
  res.json({ success: true, message: "OK", errors: null, data: orders });
});

export const updateOrderStatus = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { status: nextStatus } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  const allowed = ORDER_STATUS_TRANSITIONS[order.status];
  if (!allowed.includes(nextStatus)) {
    throw new ApiError(400, `Cannot transition order from '${order.status}' to '${nextStatus}'`);
  }

  order.status = nextStatus;
  await order.save();

  res.json({ success: true, message: "Order status updated", errors: null, data: order });
});
