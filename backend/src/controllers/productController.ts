import { Request, Response } from "express";
import { Product } from "../models/Product";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(parseInt(String(req.query.page ?? "1"), 10), 1);
  const limit = Math.min(Math.max(parseInt(String(req.query.limit ?? "12"), 10), 1), 100);
  const { category, minPrice, maxPrice, sort, search } = req.query;

  const filter: Record<string, unknown> = {};
  if (category) filter.category = category;
  if (minPrice || maxPrice) {
    filter.price = {
      ...(minPrice ? { $gte: Number(minPrice) } : {}),
      ...(maxPrice ? { $lte: Number(maxPrice) } : {}),
    };
  }
  if (search) {
    filter.$text = { $search: String(search) };
  }

  let sortSpec: Record<string, 1 | -1> = { createdAt: -1 };
  if (sort === "price_asc") sortSpec = { price: 1 };
  else if (sort === "price_desc") sortSpec = { price: -1 };
  else if (sort === "newest") sortSpec = { createdAt: -1 };

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort(sortSpec)
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    message: "OK",
    errors: null,
    data: {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    },
  });
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id).populate("category", "name slug");
  if (!product) throw new ApiError(404, "Product not found");
  res.json({ success: true, message: "OK", errors: null, data: product });
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, message: "Product created", errors: null, data: product });
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) throw new ApiError(404, "Product not found");
  res.json({ success: true, message: "Product updated", errors: null, data: product });
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");
  res.json({ success: true, message: "Product deleted", errors: null, data: null });
});
