import mongoose from "mongoose";

export async function connectDB(uri: string): Promise<void> {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log(`[db] connected to MongoDB`);

  mongoose.connection.on("error", (err) => {
    console.error("[db] connection error:", err);
  });
  mongoose.connection.on("disconnected", () => {
    console.warn("[db] disconnected");
  });
}
