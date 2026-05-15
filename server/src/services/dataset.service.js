/**
 * Dataset Service
 * Handles reading, parsing, and validating news datasets before ingestion.
 *
 * Supports JSON array datasets (file-based or request-body).
 * Normalizes article objects into a consistent shape regardless of source format.
 *
 * Handles multiple dataset formats:
 *   - Standard: { title, content, source, url, publishedAt, category }
 *   - PTI/Assignment: { Headline, story (HTML), source, link, PublishedAt, category }
 */

import { readFile } from "fs/promises";
import path from "path";
import { logger } from "../utils/logger.js";
/**
 * Dataset Service
 * Handles reading, parsing, and validating news datasets before ingestion.
 *
 * Supports JSON array datasets (file-based or request-body).
 * Normalizes article objects into a consistent shape regardless of source format.
 *
 * Handles multiple dataset formats:
 *   - Standard: { title, content, source, url, publishedAt, category }
 *   - PTI/Assignment: { Headline, story (HTML), source, link, PublishedAt, category }
 */

import { readFile } from "fs/promises";
import path from "path";
import { logger } from "../utils/logger.js";

// Required fields every article must have AFTER mapping
const REQUIRED_FIELDS = ["title", "content", "source"];

/**
 * Strip HTML tags from a string and clean up whitespace.
 *
 * @param {string} html - String potentially containing HTML tags
 * @returns {string} Plain text with HTML tags removed
 */
const stripHtmlTags = (html) => {
  if (!html || typeof html !== "string") return "";

  return html
    .replace(/<[^>]*>/g, " ")   // Remove HTML tags
    .replace(/&amp;/g, "&")     // Decode common HTML entities
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")       // Collapse multiple whitespace
    .trim();
};

/**
 * Map article fields from various dataset formats to the standard shape.
 *
 * Handles the PTI/Assignment dataset format (Headline, story, PublishedAt, link)
 * as well as the standard format (title, content, publishedAt, url).
 *
 * @param {Object} raw - Raw article object from the dataset
 * @returns {Object} Article with standardized field names
 */
const mapArticleFields = (raw) => {
  if (!raw || typeof raw !== "object") return raw;

  // Map title: Headline → title
  const title = raw.title || raw.Headline || raw.headline || "";

  // Map content: story (with HTML) → content (plain text)
  const rawContent = raw.content || raw.story || raw.Story || raw.body || raw.text || "";
  const content = stripHtmlTags(rawContent);

  // Map source
  const source = raw.source || raw.Source || raw.Copyrights || "Unknown";

  // Map URL
  const url = raw.url || raw.link || raw.Link || "";

  // Map publishedAt
  const publishedAt = raw.publishedAt || raw.PublishedAt || raw.published_at || raw.date || "";

  // Map category
  const category = raw.category || raw.Category || "other";

  // Map summary / description
  const summary = raw.summary || raw.description || raw.reason || "";

  // Preserve original _id if present (MongoDB format)
  const _id = raw._id?.$oid || raw._id || raw.id || raw.FileName || "";

  return {
    _id,
    title: typeof title === "string" ? title.trim() : "",
    content: typeof content === "string" ? content.trim() : "",
    source: typeof source === "string" ? source.trim() : "Unknown",
    url: typeof url === "string" ? url.trim() : "",
    publishedAt,
    category: typeof category === "string" ? category.trim() : "other",
    summary: typeof summary === "string" ? summary.trim() : "",
  };
};

/**
 * Read and parse a JSON dataset file from disk.
 *
 * Expected format: a JSON array of article objects:
 *   [{ title, content, source, url?, publishedAt?, category? }, ...]
 *   OR
 *   [{ Headline, story, source, link?, PublishedAt?, category? }, ...]
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

  // Map fields from any supported format to the standard shape
  const mappedArticles = articles.map(mapArticleFields);

  logger.info(`📋 Mapped ${mappedArticles.length} articles to standard format`);

  return mappedArticles;
};

/**
 * Validate a single article object.
 *
 * Returns { valid: true, article } for valid articles, or
 * { valid: false, reason } for invalid ones.
 *
 * @param {Object} article - Raw article object (already field-mapped)
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
  const normalized = {
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
  
  if (article._id) {
    normalized._id = article._id;
  }
  
  return normalized;
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

  // Map fields first if articles haven't been mapped yet (e.g., from request body)
  const mappedArticles = rawArticles.map((article) => {
    // If article already has 'title' and 'content', assume it's already mapped
    if (article.title && article.content) return article;
    // Otherwise, map from alternative field names
    return mapArticleFields(article);
  });

  for (let i = 0; i < mappedArticles.length; i++) {
    const result = validateArticle(mappedArticles[i], i);

    if (result.valid) {
      validArticles.push(normalizeArticle(mappedArticles[i]));
    } else {
      errors.push(result.reason);
    }
  }

  logger.info(
    `Dataset validation: ${validArticles.length} valid, ${errors.length} invalid out of ${rawArticles.length} total`
  );

  return { validArticles, errors };
};

// Required fields every article must have AFTER mapping
const REQUIRED_FIELDS = ["title", "content", "source"];

/**
 * Strip HTML tags from a string and clean up whitespace.
 *
 * @param {string} html - String potentially containing HTML tags
 * @returns {string} Plain text with HTML tags removed
 */
const stripHtmlTags = (html) => {
  if (!html || typeof html !== "string") return "";

  return html
    .replace(/<[^>]*>/g, " ")   // Remove HTML tags
    .replace(/&amp;/g, "&")     // Decode common HTML entities
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")       // Collapse multiple whitespace
    .trim();
};

/**
 * Map article fields from various dataset formats to the standard shape.
 *
 * Handles the PTI/Assignment dataset format (Headline, story, PublishedAt, link)
 * as well as the standard format (title, content, publishedAt, url).
 *
 * @param {Object} raw - Raw article object from the dataset
 * @returns {Object} Article with standardized field names
 */
const mapArticleFields = (raw) => {
  if (!raw || typeof raw !== "object") return raw;

  // Map title: Headline → title
  const title = raw.title || raw.Headline || raw.headline || "";

  // Map content: story (with HTML) → content (plain text)
  const rawContent = raw.content || raw.story || raw.Story || raw.body || raw.text || "";
  const content = stripHtmlTags(rawContent);

  // Map source
  const source = raw.source || raw.Source || raw.Copyrights || "Unknown";

  // Map URL
  const url = raw.url || raw.link || raw.Link || "";

  // Map publishedAt
  const publishedAt = raw.publishedAt || raw.PublishedAt || raw.published_at || raw.date || "";

  // Map category
  const category = raw.category || raw.Category || "other";

  // Map summary / description
  const summary = raw.summary || raw.description || raw.reason || "";

  // Preserve original _id if present (MongoDB format)
  const _id = raw._id?.$oid || raw._id || raw.id || raw.FileName || "";

  return {
    _id,
    title: typeof title === "string" ? title.trim() : "",
    content: typeof content === "string" ? content.trim() : "",
    source: typeof source === "string" ? source.trim() : "Unknown",
    url: typeof url === "string" ? url.trim() : "",
    publishedAt,
    category: typeof category === "string" ? category.trim() : "other",
    summary: typeof summary === "string" ? summary.trim() : "",
  };
};

/**
 * Read and parse a JSON dataset file from disk.
 *
 * Expected format: a JSON array of article objects:
 *   [{ title, content, source, url?, publishedAt?, category? }, ...]
 *   OR
 *   [{ Headline, story, source, link?, PublishedAt?, category? }, ...]
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

  // Map fields from any supported format to the standard shape
  const mappedArticles = articles.map(mapArticleFields);

  logger.info(`📋 Mapped ${mappedArticles.length} articles to standard format`);

  return mappedArticles;
};

/**
 * Validate a single article object.
 *
 * Returns { valid: true, article } for valid articles, or
 * { valid: false, reason } for invalid ones.
 *
 * @param {Object} article - Raw article object (already field-mapped)
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
  const normalized = {
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
  
  if (article._id) {
    normalized._id = article._id;
  }
  
  return normalized;
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

  // Map fields first if articles haven't been mapped yet (e.g., from request body)
  const mappedArticles = rawArticles.map((article) => {
    // If article already has 'title' and 'content', assume it's already mapped
    if (article.title && article.content) return article;
    // Otherwise, map from alternative field names
    return mapArticleFields(article);
  });

  for (let i = 0; i < mappedArticles.length; i++) {
    const result = validateArticle(mappedArticles[i], i);

    if (result.valid) {
      validArticles.push(normalizeArticle(mappedArticles[i]));
    } else {
      errors.push(result.reason);
    }
  }

  logger.info(
    `Dataset validation: ${validArticles.length} valid, ${errors.length} invalid out of ${rawArticles.length} total`
  );

  return { validArticles, errors };
};
