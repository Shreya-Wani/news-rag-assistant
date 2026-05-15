import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

/**
 * Connect to MongoDB
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);


    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected. Attempting reconnection...");
    });
  } catch (error) {
    logger.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB
 */
export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info("MongoDB disconnected gracefully.");
  } catch (error) {
    logger.error("Error disconnecting MongoDB:", error.message);
  }
};
