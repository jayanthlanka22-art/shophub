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
        { name: "Galaxy S24 Ultra 5G", description: "Snapdragon 8 Gen 3, 12GB RAM, 256GB Storage.", price: 129999, stock: 15, category: catMap.get("Mobiles & Gadgets"), images: ["https://picsum.photos/seed/phone1/600/400"] },
        { name: "OnePlus Nord CE 4", description: "Fast charging 100W, AMOLED Display.", price: 24999, stock: 45, category: catMap.get("Mobiles & Gadgets"), images: ["https://picsum.photos/seed/phone2/600/400"] },
        { name: "Sujata Mixer Grinder", description: "900 Watts, 3 Jars for heavy duty grinding.", price: 5499, stock: 30, category: catMap.get("Home Appliances"), images: ["https://picsum.photos/seed/mixer1/600/400"] },
        { name: "Voltas 1.5 Ton AC", description: "5 Star Inverter Split AC with Copper Condenser.", price: 38990, stock: 10, category: catMap.get("Home Appliances"), images: ["https://picsum.photos/seed/ac1/600/400"] },
        { name: "Men's Cotton Kurta", description: "Premium cotton traditional wear for festivals.", price: 999, stock: 100, category: catMap.get("Fashion & Ethnic"), images: ["https://picsum.photos/seed/kurta1/600/400"] },
        { name: "Women's Silk Saree", description: "Banarasi silk saree with matching blouse piece.", price: 2499, stock: 25, category: catMap.get("Fashion & Ethnic"), images: ["https://picsum.photos/seed/saree1/600/400"] }
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
