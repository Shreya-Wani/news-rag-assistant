import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js";
import { logger } from "./utils/logger.js";

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      logger.info(`🚀 NewsMind AI Server running on port ${PORT}`);
      logger.info(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    logger.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
