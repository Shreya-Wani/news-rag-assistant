import { Router } from "express";
import {
  getArticles,
  getArticleById,
  ingestArticles,
  searchArticles,
} from "../controllers/news.controller.js";

const router = Router();

router.get("/", getArticles);
router.get("/search", searchArticles);
router.get("/:id", getArticleById);
router.post("/ingest", ingestArticles);

export default router;
