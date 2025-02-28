import mongoose from "mongoose";
import env from "../../../main/config/env";

export const connectDB = async () => {
  try {
    await mongoose.connect(env.mongoUrl, {
      dbName: "sale-system",
    });

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  console.log("🚀 MongoDB disconnected");
};
