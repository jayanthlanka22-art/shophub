import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";

import { env, isProd } from "./config/env";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler";

import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import cartRoutes from "./routes/cartRoutes";
import orderRoutes from "./routes/orderRoutes";
import adminRoutes from "./routes/adminRoutes";
import bcrypt from "bcryptjs";
import { User } from "./models/User";
import { Category } from "./models/Category";
import { Product } from "./models/Product";

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser());
  app.use(mongoSanitize());
  app.use(morgan(isProd ? "combined" : "dev"));

  app.get("/api/health", (_req, res) => {
    res.json({ success: true, message: "OK", errors: null, data: { status: "healthy" } });
  });

  app.get("/api/seed", async (_req, res, next) => {
    try {
      await Promise.all([Product.deleteMany({}), Category.deleteMany({}), User.deleteOne({ email: env.SEED_ADMIN_EMAIL })]);
      
      const cats = await Category.insertMany([
        { name: "Mobiles & Gadgets", slug: "mobiles-gadgets" },
        { name: "Home Appliances", slug: "home-appliances" },
        { name: "Fashion & Ethnic", slug: "fashion-ethnic" }
      ]);
      const catMap = new Map(cats.map((c) => [c.name, c._id]));

      await Product.insertMany([
        { name: "iPhone 15 Pro Max", description: "Titanium design, A17 Pro chip, 48MP camera system.", price: 159900, stock: 15, category: catMap.get("Mobiles & Gadgets"), images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800"] },
        { name: "MacBook Air M3", description: "Supercharged by M3, up to 18 hours of battery life.", price: 114900, stock: 24, category: catMap.get("Mobiles & Gadgets"), images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800"] },
        { name: "Sony WH-1000XM5", description: "Industry leading noise canceling wireless headphones.", price: 29990, stock: 45, category: catMap.get("Mobiles & Gadgets"), images: ["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800"] },
        { name: "Apple Watch Ultra 2", description: "Rugged and capable, built for extreme environments.", price: 89900, stock: 10, category: catMap.get("Mobiles & Gadgets"), images: ["https://images.unsplash.com/photo-1434493789847-2f02b0d287fc?q=80&w=800"] },
        
        { name: "De'Longhi Espresso Machine", description: "Premium stainless steel espresso and cappuccino maker.", price: 24999, stock: 12, category: catMap.get("Home Appliances"), images: ["https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?q=80&w=800"] },
        { name: "Dyson Air Purifier", description: "HEPA air purifier and tower fan, removes 99.97% allergens.", price: 39900, stock: 8, category: catMap.get("Home Appliances"), images: ["https://images.unsplash.com/photo-1585771724684-38269d6639fd?q=80&w=800"] },
        { name: "NutriBullet Pro Blender", description: "900W high-speed blender and smoothie maker.", price: 8999, stock: 30, category: catMap.get("Home Appliances"), images: ["https://images.unsplash.com/photo-1585515320310-259814833e62?q=80&w=800"] },

        { name: "Premium Silk Kurta Set", description: "Handcrafted embroidered silk kurta for festive wear.", price: 4999, stock: 50, category: catMap.get("Fashion & Ethnic"), images: ["https://images.unsplash.com/photo-1583391733958-d1574fa99fc2?q=80&w=800"] },
        { name: "Banarasi Silk Saree", description: "Authentic woven banarasi silk saree with blouse piece.", price: 7499, stock: 20, category: catMap.get("Fashion & Ethnic"), images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800"] },
        { name: "Minimalist Leather Sneakers", description: "Genuine white leather sneakers for everyday comfort.", price: 3499, stock: 100, category: catMap.get("Fashion & Ethnic"), images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800"] },
        { name: "Classic Chronograph Watch", description: "Water-resistant stainless steel analog watch.", price: 5999, stock: 40, category: catMap.get("Fashion & Ethnic"), images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800"] }
      ]);

      const passwordHash = await bcrypt.hash(env.SEED_ADMIN_PASSWORD, 10);
      await User.create({ name: "Admin", email: env.SEED_ADMIN_EMAIL, passwordHash, role: "admin" });
      
      res.json({ success: true, message: "Added Indian products to database!" });
    } catch (err) { next(err); }
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/admin", adminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
