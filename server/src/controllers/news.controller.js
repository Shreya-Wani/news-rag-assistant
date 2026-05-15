import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import NewsArticle from "../models/newsArticle.model.js";
import { ingestFromFile } from "../services/ingestion.service.js";
import path from "path";

/**
 * @desc    Get all news articles (paginated)
 * @route   GET /api/v1/news
 * @access  Public
 */
export const getArticles = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const total = await NewsArticle.countDocuments();
  const articles = await NewsArticle.find()
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json(
    new ApiResponse(200, { articles, total, page, limit }, "Articles retrieved")
  );
});

/**
 * @desc    Get a single article by ID
 * @route   GET /api/v1/news/:id
 * @access  Public
 */
export const getArticleById = asyncHandler(async (req, res) => {
  const article = await NewsArticle.findById(req.params.id);
  if (!article) {
    return res.status(404).json(new ApiResponse(404, null, "Article not found"));
  }
  res.status(200).json(
    new ApiResponse(200, { article }, "Article retrieved")
  );
});

/**
 * @desc    Ingest news articles (admin)
 * @route   POST /api/v1/news/ingest
 * @access  Private
 */
export const ingestArticles = asyncHandler(async (req, res) => {
  // For demo purposes, we will trigger ingestion from the local sample dataset
  const datasetPath = path.join(process.cwd(), "data", "sample-dataset.json");
  
  // We don't await this so the request doesn't timeout, but we could depending on requirements.
  // We'll await it here for simplicity of the prototype.
  const stats = await ingestFromFile(datasetPath);

  res.status(201).json(
    new ApiResponse(201, stats, "Articles ingestion completed")
  );
});

/**
 * @desc    Search articles by query
 * @route   GET /api/v1/news/search
 * @access  Public
 */
export const searchArticles = asyncHandler(async (req, res) => {
  // TODO: Implement semantic search
  res.status(200).json(
    new ApiResponse(200, { results: [] }, "Search completed")
  );
});
