import { Request, Response } from "express";
import { Category } from "../models/Category";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json({ success: true, message: "OK", errors: null, data: categories });
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;
  const slug = slugify(name);

  const existing = await Category.findOne({ $or: [{ name }, { slug }] });
  if (existing) throw new ApiError(409, "Category already exists");

  const category = await Category.create({ name, slug });
  res.status(201).json({ success: true, message: "Category created", errors: null, data: category });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const update: Record<string, unknown> = { ...req.body };
  if (typeof update.name === "string") update.slug = slugify(update.name);

  const category = await Category.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });
  if (!category) throw new ApiError(404, "Category not found");
  res.json({ success: true, message: "Category updated", errors: null, data: category });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");
  res.json({ success: true, message: "Category deleted", errors: null, data: null });
});
