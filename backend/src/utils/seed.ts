import bcrypt from "bcryptjs";
import { connectDB } from "../config/db";
import { env } from "../config/env";
import { User } from "../models/User";
import { Category } from "../models/Category";
import { Product } from "../models/Product";
import mongoose from "mongoose";

function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const CATEGORY_NAMES = ["Electronics", "Home & Kitchen", "Sportswear"];

const PRODUCTS: { name: string; description: string; price: number; stock: number; category: string; images: string[] }[] = [
  { name: "Wireless Mechanical Keyboard", description: "75% layout hot-swappable mechanical keyboard with RGB backlight.", price: 89.99, stock: 24, category: "Electronics", images: ["https://picsum.photos/seed/kb1/600/400"] },
  { name: "Noise-Cancelling Headphones", description: "Over-ear ANC headphones with 30-hour battery life.", price: 149.5, stock: 15, category: "Electronics", images: ["https://picsum.photos/seed/hp1/600/400"] },
  { name: "4K Webcam", description: "Ultra HD webcam with autofocus and built-in ring light.", price: 59.99, stock: 40, category: "Electronics", images: ["https://picsum.photos/seed/wc1/600/400"] },
  { name: "Portable SSD 1TB", description: "USB-C portable solid state drive, read speeds up to 1050MB/s.", price: 109.0, stock: 30, category: "Electronics", images: ["https://picsum.photos/seed/ssd1/600/400"] },
  { name: "Smart LED Desk Lamp", description: "Dimmable desk lamp with app control and color temperature presets.", price: 34.99, stock: 3, category: "Electronics", images: ["https://picsum.photos/seed/lamp1/600/400"] },
  { name: "Stainless Steel Cookware Set", description: "10-piece tri-ply stainless steel cookware set, oven safe.", price: 199.99, stock: 12, category: "Home & Kitchen", images: ["https://picsum.photos/seed/cook1/600/400"] },
  { name: "Electric Kettle", description: "1.7L rapid-boil electric kettle with auto shut-off.", price: 29.99, stock: 50, category: "Home & Kitchen", images: ["https://picsum.photos/seed/kettle1/600/400"] },
  { name: "Air Fryer 5.5L", description: "Digital air fryer with 8 presets and non-stick basket.", price: 79.99, stock: 4, category: "Home & Kitchen", images: ["https://picsum.photos/seed/fryer1/600/400"] },
  { name: "Memory Foam Pillow Set", description: "Set of 2 ergonomic cervical support pillows.", price: 44.99, stock: 22, category: "Home & Kitchen", images: ["https://picsum.photos/seed/pillow1/600/400"] },
  { name: "Ceramic Knife Set", description: "6-piece ceramic knife set with block, rust-proof blades.", price: 39.99, stock: 18, category: "Home & Kitchen", images: ["https://picsum.photos/seed/knife1/600/400"] },
  { name: "Running Shoes", description: "Lightweight breathable running shoes with cushioned sole.", price: 64.99, stock: 35, category: "Sportswear", images: ["https://picsum.photos/seed/shoe1/600/400"] },
  { name: "Yoga Mat Pro", description: "6mm extra-thick non-slip yoga mat with carry strap.", price: 24.99, stock: 60, category: "Sportswear", images: ["https://picsum.photos/seed/yoga1/600/400"] },
  { name: "Compression Leggings", description: "Moisture-wicking compression leggings for training.", price: 32.5, stock: 45, category: "Sportswear", images: ["https://picsum.photos/seed/legging1/600/400"] },
  { name: "Adjustable Dumbbell Set", description: "5-25kg adjustable dumbbell pair for home gym use.", price: 129.99, stock: 2, category: "Sportswear", images: ["https://picsum.photos/seed/dumbbell1/600/400"] },
  { name: "Insulated Water Bottle", description: "1L vacuum-insulated stainless steel bottle, keeps cold 24h.", price: 19.99, stock: 70, category: "Sportswear", images: ["https://picsum.photos/seed/bottle1/600/400"] },
];

async function seed() {
  await connectDB(env.MONGO_URI);
  console.log("[seed] connected, clearing existing catalog + admin user...");

  await Promise.all([
    Product.deleteMany({}),
    Category.deleteMany({}),
    User.deleteOne({ email: env.SEED_ADMIN_EMAIL }),
  ]);

  const categoryDocs = await Category.insertMany(
    CATEGORY_NAMES.map((name) => ({ name, slug: slugify(name) }))
  );
  const categoryByName = new Map(categoryDocs.map((c) => [c.name, c._id]));

  await Product.insertMany(
    PRODUCTS.map((p) => ({
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      images: p.images,
      category: categoryByName.get(p.category),
    }))
  );

  const passwordHash = await bcrypt.hash(env.SEED_ADMIN_PASSWORD, 10);
  await User.create({
    name: "Admin",
    email: env.SEED_ADMIN_EMAIL,
    passwordHash,
    role: "admin",
  });

  console.log(`[seed] done: ${categoryDocs.length} categories, ${PRODUCTS.length} products`);
  console.log(`[seed] admin login -> email: ${env.SEED_ADMIN_EMAIL} password: ${env.SEED_ADMIN_PASSWORD}`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
