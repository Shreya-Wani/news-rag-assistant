/**
 * Ingest Routes
 *
 * POST /api/ingest         — Ingest articles from request body
 * POST /api/ingest/file    — Ingest articles from a file path
 */

import { Router } from "express";
import {
  ingestFromBody,
  ingestFromFilePath,
} from "../controllers/ingest.controller.js";

const router = Router();

router.post("/", ingestFromBody);
router.post("/file", ingestFromFilePath);

export default router;
