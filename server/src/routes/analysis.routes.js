/**
 * Analysis Routes
 *
 * POST /api/analyze — Analyze an AI chatbot response with deeper AI analysis
 */

import { Router } from "express";
import { analyze } from "../controllers/analysis.controller.js";

const router = Router();

router.post("/", analyze);

export default router;
