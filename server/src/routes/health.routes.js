import { Router } from "express";
import { ApiResponse } from "../utils/ApiResponse.js";

const router = Router();

/**
 * @desc    Health check endpoint
 * @route   GET /api/v1/health
 * @access  Public
 */
router.get("/", (req, res) => {
  res.status(200).json(
    new ApiResponse(
      200,
      {
        status: "healthy",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      },
      "NewsMind AI Server is running"
    )
  );
});

export default router;
