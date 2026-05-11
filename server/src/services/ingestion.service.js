/**
 * Ingestion Service
 * Orchestrates the full RAG ingestion pipeline:
 *
 *   Dataset → Validate → Normalize → Chunk → Embed → Deduplicate → Store in Pinecone
 *
 * This is the main entry point for ingesting news articles into the
 * vector store. It coordinates the chunking, embedding, and storage
 * services and produces detailed ingestion statistics.
 */

import { chunkArticle } from "./chunking.service.js";
import { generateBatchEmbeddings } from "./embedding.service.js";
import {
  upsertVectors,
  checkExistingVectors,
} from "./vectorStore.service.js";
import {
  readDatasetFromFile,
  validateAndNormalizeDataset,
} from "./dataset.service.js";
import { CONSTANTS } from "../config/constants.js";
import { logger } from "../utils/logger.js";

/**
 * Generate a deterministic vector ID from article metadata.
 *
 * Uses articleId + chunkIndex to create a stable ID so that
 * re-running ingestion on the same data does not create duplicates.
 *
 * @param {string} articleId - Unique article identifier
 * @param {number} chunkIndex - Chunk position within the article
 * @returns {string} Deterministic vector ID
 */
const generateVectorId = (articleId, chunkIndex) => {
  return `article-${articleId}-chunk-${chunkIndex}`;
};

/**
 * Retry a function with exponential backoff.
 *
 * If the function throws, it waits RETRY_DELAY_MS * attempt before retrying.
 * After MAX_RETRIES attempts, the last error is thrown.
 *
 * @param {Function} fn - Async function to retry
 * @param {number} retries - Max retry attempts
 * @returns {Promise<*>} Return value of fn
 */
const withRetry = async (fn, retries = CONSTANTS.MAX_RETRIES) => {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      logger.warn(
        `Attempt ${attempt}/${retries} failed: ${error.message}`
      );

      if (attempt < retries) {
        const delay = CONSTANTS.RETRY_DELAY_MS * attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

/**
 * Process a single article through the full pipeline:
 * chunk → generate IDs → check duplicates → embed → prepare vectors.
 *
 * @param {Object} article - Normalized article object
 * @param {number} articleIndex - Index for ID generation (when no _id)
 * @returns {Promise<{vectors: Array, chunkCount: number, skippedCount: number}>}
 */
const processArticle = async (article, articleIndex) => {
  // 1. Chunk the article content
  const chunks = await chunkArticle({
    ...article,
    _id: article._id || `dataset-${articleIndex}`,
  });

  if (chunks.length === 0) {
    logger.warn(`Article "${article.title}" produced no chunks, skipping`);
    return { vectors: [], chunkCount: 0, skippedCount: 0 };
  }

  // 2. Generate deterministic vector IDs for duplicate detection
  const articleId = article._id || `dataset-${articleIndex}`;
  const vectorIds = chunks.map((_, i) =>
    generateVectorId(articleId, i)
  );

  // 3. Check which chunks already exist in Pinecone (duplicate prevention)
  const existingIds = await checkExistingVectors(vectorIds);

  // 4. Filter out already-ingested chunks
  const newChunks = [];
  const newIds = [];

  for (let i = 0; i < chunks.length; i++) {
    if (!existingIds.has(vectorIds[i])) {
      newChunks.push(chunks[i]);
      newIds.push(vectorIds[i]);
    }
  }

  const skippedCount = chunks.length - newChunks.length;

  if (skippedCount > 0) {
    logger.debug(
      `Skipped ${skippedCount} duplicate chunks for "${article.title}"`
    );
  }

  if (newChunks.length === 0) {
    return { vectors: [], chunkCount: chunks.length, skippedCount };
  }

  // 5. Generate embeddings for new chunks (with retry)
  const texts = newChunks.map((chunk) => chunk.text);
  const embeddings = await withRetry(() => generateBatchEmbeddings(texts));

  // 6. Assemble Pinecone vector objects
  const vectors = newChunks.map((chunk, i) => ({
    id: newIds[i],
    values: embeddings[i],
    metadata: {
      ...chunk.metadata,
      text: chunk.text, // Store raw text in metadata for retrieval
    },
  }));

  return { vectors, chunkCount: chunks.length, skippedCount };
};

/**
 * Ingest articles from a JSON dataset file.
 *
 * Full pipeline:
 *   1. Read dataset from file
 *   2. Validate & normalize articles
 *   3. Process each article (chunk → embed → deduplicate)
 *   4. Batch upsert vectors into Pinecone
 *   5. Return ingestion statistics
 *
 * @param {string} filePath - Path to the JSON dataset file
 * @returns {Promise<Object>} Ingestion statistics
 */
export const ingestFromFile = async (filePath) => {
  const startTime = Date.now();

  logger.info("🚀 Starting ingestion pipeline from file...");

  // 1. Read and parse dataset
  const rawArticles = await readDatasetFromFile(filePath);

  return ingestArticles(rawArticles, startTime);
};

/**
 * Ingest articles from a pre-parsed array (e.g., from request body).
 *
 * @param {Array<Object>} rawArticles - Array of raw article objects
 * @param {number} startTime - Timestamp when ingestion began (for timing)
 * @returns {Promise<Object>} Ingestion statistics
 */
export const ingestArticles = async (rawArticles, startTime = Date.now()) => {
  // 2. Validate and normalize
  const { validArticles, errors: validationErrors } =
    validateAndNormalizeDataset(rawArticles);

  if (validArticles.length === 0) {
    return {
      success: false,
      totalArticles: rawArticles.length,
      validArticles: 0,
      totalChunks: 0,
      embeddedChunks: 0,
      skippedChunks: 0,
      failedArticles: rawArticles.length,
      validationErrors,
      processingTimeMs: Date.now() - startTime,
    };
  }

  // 3. Process articles in batches to control concurrency
  const batchSize = CONSTANTS.INGESTION_BATCH_SIZE;
  let totalChunks = 0;
  let embeddedChunks = 0;
  let skippedChunks = 0;
  let failedArticles = 0;
  const allVectors = [];
  const processingErrors = [];

  for (let i = 0; i < validArticles.length; i += batchSize) {
    const batch = validArticles.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(validArticles.length / batchSize);

    logger.info(
      `📦 Processing article batch ${batchNum}/${totalBatches} (${batch.length} articles)`
    );

    // Process each article in the batch concurrently
    const results = await Promise.allSettled(
      batch.map((article, idx) => processArticle(article, i + idx))
    );

    for (let j = 0; j < results.length; j++) {
      const result = results[j];

      if (result.status === "fulfilled") {
        const { vectors, chunkCount, skippedCount } = result.value;
        totalChunks += chunkCount;
        skippedChunks += skippedCount;
        embeddedChunks += vectors.length;
        allVectors.push(...vectors);
      } else {
        failedArticles++;
        const articleTitle = batch[j]?.title || `Article ${i + j}`;
        const errorMsg = `Failed to process "${articleTitle}": ${result.reason?.message || result.reason}`;
        processingErrors.push(errorMsg);
        logger.error(errorMsg);
      }
    }
  }

  // 4. Batch upsert all vectors into Pinecone
  let upsertedCount = 0;

  if (allVectors.length > 0) {
    logger.info(`📤 Upserting ${allVectors.length} vectors into Pinecone...`);

    try {
      upsertedCount = await withRetry(() => upsertVectors(allVectors));
    } catch (error) {
      logger.error(`❌ Pinecone upsert failed: ${error.message}`);
      processingErrors.push(`Pinecone upsert failed: ${error.message}`);
    }
  }

  // 5. Compile statistics
  const processingTimeMs = Date.now() - startTime;

  const stats = {
    success: failedArticles === 0 && upsertedCount > 0,
    totalArticles: rawArticles.length,
    validArticles: validArticles.length,
    totalChunks,
    embeddedChunks: upsertedCount,
    skippedChunks,
    failedArticles: failedArticles + validationErrors.length,
    processingTimeMs,
    processingTimeSec: (processingTimeMs / 1000).toFixed(2),
    validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
    processingErrors: processingErrors.length > 0 ? processingErrors : undefined,
  };

  logger.info("=".repeat(50));
  logger.info("📊 INGESTION PIPELINE COMPLETE");
  logger.info(`   Total articles:    ${stats.totalArticles}`);
  logger.info(`   Valid articles:    ${stats.validArticles}`);
  logger.info(`   Total chunks:      ${stats.totalChunks}`);
  logger.info(`   Embedded chunks:   ${stats.embeddedChunks}`);
  logger.info(`   Skipped (dupes):   ${stats.skippedChunks}`);
  logger.info(`   Failed articles:   ${stats.failedArticles}`);
  logger.info(`   Processing time:   ${stats.processingTimeSec}s`);
  logger.info("=".repeat(50));

  return stats;
};
