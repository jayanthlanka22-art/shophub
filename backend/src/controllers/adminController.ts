import { Request, Response } from "express";
import { User } from "../models/User";
import { Product } from "../models/Product";
import { Order } from "../models/Order";
import { asyncHandler } from "../utils/asyncHandler";

export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await User.find().select("-passwordHash").sort({ createdAt: -1 });
  res.json({ success: true, message: "OK", errors: null, data: users });
});

export const getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const [totalProducts, totalOrders, lowStock, revenueAgg] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    Product.find({ stock: { $lt: 5 } }).select("name stock"),
    Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
  ]);

  const totalRevenue = revenueAgg[0]?.total ?? 0;

  res.json({
    success: true,
    message: "OK",
    errors: null,
    data: { totalRevenue, totalOrders, totalProducts, lowStock },
  });
});
