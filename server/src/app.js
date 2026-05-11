import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";

import { corsOptions } from "./config/cors.js";
import { rateLimiter } from "./middlewares/rateLimiter.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";

// Route imports
import healthRoutes from "./routes/health.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import newsRoutes from "./routes/news.routes.js";

const app = express();

// =============================================
// Global Middlewares
// =============================================

// Security headers
app.use(helmet());

// CORS
app.use(cors(corsOptions));

// Request logging
app.use(morgan("dev"));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parsing
app.use(cookieParser());

// Response compression
app.use(compression());

// Rate limiting
app.use("/api", rateLimiter);

// =============================================
// API Routes
// =============================================

app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/news", newsRoutes);

// =============================================
// Error Handling
// =============================================

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
