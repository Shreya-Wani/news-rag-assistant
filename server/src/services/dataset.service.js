/**
 * Dataset Service
 * Handles reading, parsing, and validating news datasets before ingestion.
 *
 * Supports JSON array datasets (file-based or request-body).
 * Normalizes article objects into a consistent shape regardless of source format.
 */

import { readFile } from "fs/promises";
import path from "path";
import { logger } from "../utils/logger.js";

// Required fields every article must have to be valid
const REQUIRED_FIELDS = ["title", "content", "source"];

/**
 * Read and parse a JSON dataset file from disk.
 *
 * Expected format: a JSON array of article objects:
 *   [{ title, content, source, url?, publishedAt?, category? }, ...]
 *
 * @param {string} filePath - Absolute or relative path to the JSON file
 * @returns {Promise<Array<Object>>} Parsed array of article objects
 */
export const readDatasetFromFile = async (filePath) => {
  const absolutePath = path.resolve(filePath);

  logger.info(`📂 Reading dataset from: ${absolutePath}`);

  const raw = await readFile(absolutePath, "utf-8");
  const data = JSON.parse(raw);

  // Handle both { articles: [...] } wrapper and plain array formats
  const articles = Array.isArray(data) ? data : data.articles || data.data || [];

  if (!Array.isArray(articles)) {
    throw new Error(
      "Dataset must be a JSON array or an object with an 'articles' array"
    );
  }

  logger.info(`📊 Parsed ${articles.length} raw articles from file`);
  return articles;
};

/**
 * Validate a single article object.
 *
 * Returns { valid: true, article } for valid articles, or
 * { valid: false, reason } for invalid ones.
 *
 * @param {Object} article - Raw article object
 * @param {number} index - Position in the dataset (for logging)
 * @returns {{ valid: boolean, article?: Object, reason?: string }}
 */
export const validateArticle = (article, index = 0) => {
  if (!article || typeof article !== "object") {
    return { valid: false, reason: `Article at index ${index} is not an object` };
  }

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (!article[field] || typeof article[field] !== "string" || article[field].trim() === "") {
      return {
        valid: false,
        reason: `Article at index ${index} is missing or has empty required field: "${field}"`,
      };
    }
  }

  // Content must have meaningful length (skip very short snippets)
  if (article.content.trim().length < 50) {
    return {
      valid: false,
      reason: `Article at index ${index} ("${article.title}") has content shorter than 50 characters`,
    };
  }

  return { valid: true };
};

/**
 * Normalize an article object into a consistent shape.
 *
 * Ensures publishedAt is a valid Date, trims whitespace, and
 * assigns defaults for optional fields.
 *
 * @param {Object} article - Raw article object
 * @returns {Object} Normalized article
 */
export const normalizeArticle = (article) => {
  return {
    title: article.title.trim(),
    content: article.content.trim(),
    summary: (article.summary || article.description || "").trim(),
    source: article.source.trim(),
    url: (article.url || "").trim(),
    category: (article.category || "other").toLowerCase().trim(),
    publishedAt: article.publishedAt
      ? new Date(article.publishedAt)
      : new Date(),
  };
};

/**
 * Validate and normalize an entire dataset.
 *
 * Filters out invalid articles, normalizes the rest, and returns
 * both the clean dataset and a list of validation errors.
 *
 * @param {Array<Object>} rawArticles - Raw articles from file or request body
 * @returns {{ validArticles: Array, errors: Array<string> }}
 */
export const validateAndNormalizeDataset = (rawArticles) => {
  const validArticles = [];
  const errors = [];

  for (let i = 0; i < rawArticles.length; i++) {
    const result = validateArticle(rawArticles[i], i);

    if (result.valid) {
      validArticles.push(normalizeArticle(rawArticles[i]));
    } else {
      errors.push(result.reason);
    }
  }

  logger.info(
    `Dataset validation: ${validArticles.length} valid, ${errors.length} invalid out of ${rawArticles.length} total`
  );

  return { validArticles, errors };
};
