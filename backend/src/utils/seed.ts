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

const CATEGORY_NAMES = ["Laptops & Tablets", "Mobile Accessories", "Smart Gadgets"];

const PRODUCTS: { name: string; description: string; price: number; stock: number; category: string; images: string[] }[] = [
  { name: "JioBook 4G Laptop", description: "11.6\" HD display, JioOS, Qualcomm Snapdragon 665, 4GB RAM, 64GB eMMC. Built for India with Jio connectivity.", price: 16499, stock: 20, category: "Laptops & Tablets", images: ["https://picsum.photos/seed/jiobook/600/400"] },
  { name: "Realme Pad X WiFi Tablet", description: "11\" 2K display, Snapdragon 695, 6GB RAM, 128GB storage, quad speakers with Dolby Atmos.", price: 19999, stock: 15, category: "Laptops & Tablets", images: ["https://picsum.photos/seed/realmepad/600/400"] },
  { name: "Avita Liber V14 Laptop", description: "14\" FHD IPS, Intel Core i5 10th Gen, 8GB RAM, 512GB SSD. Made for Indian students & professionals.", price: 38990, stock: 10, category: "Laptops & Tablets", images: ["https://picsum.photos/seed/avita14/600/400"] },
  { name: "Lava Tab T81N", description: "8\" HD display Android tablet with 4G calling, 3GB RAM, 32GB storage. Affordable made-in-India tablet.", price: 9499, stock: 35, category: "Laptops & Tablets", images: ["https://picsum.photos/seed/lavatab/600/400"] },
  { name: "Coconics Enabler C1C11 Laptop", description: "14\" FHD, Intel Celeron, 4GB RAM, 128GB SSD. India's first indigenously designed laptop brand from Kerala.", price: 24999, stock: 8, category: "Laptops & Tablets", images: ["https://picsum.photos/seed/coconics/600/400"] },
  { name: "boAt Airdopes 141 TWS Earbuds", description: "42H playtime, ENx™ noise cancellation, BEAST mode low latency, IPX4 sweat resistance. India's #1 audio brand.", price: 1299, stock: 120, category: "Mobile Accessories", images: ["https://picsum.photos/seed/boatbuds/600/400"] },
  { name: "Portronics Harmonics Z5 Neckband", description: "Bluetooth 5.2 neckband with 50H playback, ENC, dual pairing, fast charge. Designed for Indian commuters.", price: 899, stock: 80, category: "Mobile Accessories", images: ["https://picsum.photos/seed/portronics/600/400"] },
  { name: "Ambrane 20000mAh Power Bank", description: "20W fast charging power bank with Type-C input, dual USB output, LED display. BIS certified.", price: 1499, stock: 60, category: "Mobile Accessories", images: ["https://picsum.photos/seed/ambrane/600/400"] },
  { name: "Croma 20W Type-C Charger", description: "20W PD fast charger with BIS certification, compact design. Compatible with all iPhones & Android phones.", price: 799, stock: 90, category: "Mobile Accessories", images: ["https://picsum.photos/seed/cromacharger/600/400"] },
  { name: "Stuffcool Mag Wireless Charger", description: "15W MagSafe-compatible wireless charger pad, anti-slip base, LED indicator. Made for Indian smartphones.", price: 1999, stock: 40, category: "Mobile Accessories", images: ["https://picsum.photos/seed/stuffcool/600/400"] },
  { name: "Noise ColorFit Pro 5 Smartwatch", description: "1.85\" AMOLED display, Bluetooth calling, 100+ sports modes, SpO2. India's beloved smartwatch brand.", price: 4499, stock: 45, category: "Smart Gadgets", images: ["https://picsum.photos/seed/noisewatch/600/400"] },
  { name: "Fire-Boltt Phoenix Ultra Smartwatch", description: "1.39\" HD display, built-in GPS, Bluetooth calling, heart rate & SpO2. Stainless steel rotating crown.", price: 3499, stock: 55, category: "Smart Gadgets", images: ["https://picsum.photos/seed/fireboltt/600/400"] },
  { name: "boAt Wave Call 2 Smartwatch", description: "1.83\" HD display, advanced BT calling, Crest+ health ecosystem, 700+ active modes, IP68 rated.", price: 2499, stock: 65, category: "Smart Gadgets", images: ["https://picsum.photos/seed/boatwatch/600/400"] },
  { name: "Portronics SoundDrum 1 BT Speaker", description: "15W portable Bluetooth speaker with TWS pairing, 8H battery, USB/AUX/FM/SD support. IPX6 waterproof.", price: 1799, stock: 30, category: "Smart Gadgets", images: ["https://picsum.photos/seed/sounddrum/600/400"] },
  { name: "Zebronics Zeb-Smart Cam 104", description: "2MP WiFi smart security camera, 360° pan-tilt, night vision, two-way talk, SD card support. Made in India.", price: 2199, stock: 25, category: "Smart Gadgets", images: ["https://picsum.photos/seed/zebcam/600/400"] },
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
