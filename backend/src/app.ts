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
        { name: "Electronics", slug: "electronics" },
        { name: "Home & Kitchen", slug: "home-kitchen" },
        { name: "Sportswear", slug: "sportswear" }
      ]);
      const catMap = new Map(cats.map((c) => [c.name, c._id]));

      await Product.insertMany([
        { name: "Wireless Mechanical Keyboard", description: "75% layout hot-swappable.", price: 89.99, stock: 24, category: catMap.get("Electronics"), images: ["https://picsum.photos/seed/kb1/600/400"] },
        { name: "Electric Kettle", description: "1.7L rapid-boil electric kettle.", price: 29.99, stock: 50, category: catMap.get("Home & Kitchen"), images: ["https://picsum.photos/seed/kettle1/600/400"] },
        { name: "Running Shoes", description: "Lightweight breathable.", price: 64.99, stock: 35, category: catMap.get("Sportswear"), images: ["https://picsum.photos/seed/shoe1/600/400"] }
      ]);

      const passwordHash = await bcrypt.hash(env.SEED_ADMIN_PASSWORD, 10);
      await User.create({ name: "Admin", email: env.SEED_ADMIN_EMAIL, passwordHash, role: "admin" });
      
      res.json({ success: true, message: "Database seeded successfully via API!" });
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
