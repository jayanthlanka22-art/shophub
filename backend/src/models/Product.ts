import { Schema, model, Document, Types } from "mongoose";

export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  category: Types.ObjectId;
  stock: number;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: { type: [String], default: [] },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text" });

export const Product = model<IProduct>("Product", productSchema);
