/**
 * Ingest Controller
 * Handles HTTP requests for the news article ingestion pipeline.
 *
 * POST /api/ingest         — Ingest articles from request body
 * POST /api/ingest/file    — Ingest articles from a dataset file on disk
 */

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { ingestArticles, ingestFromFile } from "../services/ingestion.service.js";

/**
 * @desc    Ingest news articles from request body
 * @route   POST /api/ingest
 * @access  Public (should be restricted to admin in production)
 *
 * Expected body:
 *   { "articles": [ { title, content, source, url?, publishedAt?, category? }, ... ] }
 *
 * Or a plain JSON array:
 *   [ { title, content, source, ... }, ... ]
 */
export const ingestFromBody = asyncHandler(async (req, res) => {
  const { articles, data } = req.body;

  // Accept both { articles: [...] } and plain array
  const rawArticles = articles || data || (Array.isArray(req.body) ? req.body : null);

  if (!rawArticles || !Array.isArray(rawArticles) || rawArticles.length === 0) {
    throw new ApiError(
      400,
      "Request body must contain an 'articles' array with at least one article"
    );
  }

  const stats = await ingestArticles(rawArticles);

  const statusCode = stats.success ? 200 : 207; // 207 Multi-Status if partial failures

  res.status(statusCode).json(
    new ApiResponse(
      statusCode,
      stats,
      stats.success
        ? `Ingestion complete: ${stats.embeddedChunks} chunks embedded from ${stats.validArticles} articles`
        : `Ingestion completed with issues: ${stats.failedArticles} articles failed`
    )
  );
});

/**
 * @desc    Ingest news articles from a JSON file on disk
 * @route   POST /api/ingest/file
 * @access  Public (should be restricted to admin in production)
 *
 * Expected body:
 *   { "filePath": "/absolute/path/to/dataset.json" }
 */
export const ingestFromFilePath = asyncHandler(async (req, res) => {
  const { filePath } = req.body;

  if (!filePath || typeof filePath !== "string") {
    throw new ApiError(400, "Request body must contain a 'filePath' string");
  }

  const stats = await ingestFromFile(filePath);

  const statusCode = stats.success ? 200 : 207;

  res.status(statusCode).json(
    new ApiResponse(
      statusCode,
      stats,
      stats.success
        ? `File ingestion complete: ${stats.embeddedChunks} chunks embedded from ${stats.validArticles} articles`
        : `File ingestion completed with issues: ${stats.failedArticles} articles failed`
    )
  );
});
