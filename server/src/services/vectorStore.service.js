/**
 * Vector Store Service
 * Handles all Pinecone vector database operations.
 *
 * Provides upsert, query, delete, and existence-check methods
 * used by the ingestion pipeline and (later) the RAG retrieval chain.
 */

import { getPineconeIndex } from "../config/pinecone.js";
import { CONSTANTS } from "../config/constants.js";
import { logger } from "../utils/logger.js";

/**
 * Upsert vectors into Pinecone in batches.
 *
 * Pinecone limits upsert payload size, so we split into batches
 * of PINECONE_BATCH_SIZE (default 100) to stay within limits.
 *
 * @param {Array<{id: string, values: number[], metadata: Object}>} vectors
 * @returns {Promise<number>} Total number of vectors upserted
 */
export const upsertVectors = async (vectors) => {
  if (!vectors || vectors.length === 0) return 0;

  const index = await getPineconeIndex();
  const namespace = index.namespace(CONSTANTS.PINECONE_NAMESPACE);
  const batchSize = CONSTANTS.PINECONE_BATCH_SIZE;
  let totalUpserted = 0;

  // Split into batches to respect Pinecone's payload size limit
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);

    await namespace.upsert(batch);
    totalUpserted += batch.length;

    logger.debug(
      `Upserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} vectors)`
    );
  }

  logger.info(`✅ Upserted ${totalUpserted} vectors into Pinecone`);
  return totalUpserted;
};

/**
 * Query Pinecone for similar vectors.
 *
 * @param {number[]} queryVector - Query embedding vector
 * @param {number} topK - Number of top results to return
 * @param {Object} filter - Optional metadata filter
 * @returns {Promise<Array>} Matched documents with scores
 */
export const querySimilarVectors = async (queryVector, topK = CONSTANTS.PINECONE_TOP_K, filter = {}) => {
  const index = await getPineconeIndex();
  const namespace = index.namespace(CONSTANTS.PINECONE_NAMESPACE);

  const queryOptions = {
    vector: queryVector,
    topK,
    includeMetadata: true,
    includeValues: false,
  };

  // Only add filter if it has keys — Pinecone rejects empty filter objects
  if (Object.keys(filter).length > 0) {
    queryOptions.filter = filter;
  }

  const result = await namespace.query(queryOptions);

  return result.matches || [];
};

/**
 * Delete vectors by their IDs.
 *
 * @param {string[]} ids - Vector IDs to delete
 * @returns {Promise<void>}
 */
export const deleteVectors = async (ids) => {
  if (!ids || ids.length === 0) return;

  const index = await getPineconeIndex();
  const namespace = index.namespace(CONSTANTS.PINECONE_NAMESPACE);

  await namespace.deleteMany(ids);
  logger.info(`Deleted ${ids.length} vectors from Pinecone`);
};

/**
 * Check which vector IDs already exist in Pinecone.
 *
 * This is the key function for retry-safe / duplicate-prevention logic:
 * before upserting, we check which IDs are already stored and skip them.
 *
 * @param {string[]} ids - Vector IDs to check
 * @returns {Promise<Set<string>>} Set of IDs that already exist
 */
export const checkExistingVectors = async (ids) => {
  if (!ids || ids.length === 0) return new Set();

  const index = await getPineconeIndex();
  const namespace = index.namespace(CONSTANTS.PINECONE_NAMESPACE);

  try {
    // Fetch by IDs — only returns records that exist
    const fetchResult = await namespace.fetch(ids);
    const existingIds = new Set(Object.keys(fetchResult.records || {}));

    logger.debug(
      `Checked ${ids.length} IDs → ${existingIds.size} already exist in Pinecone`
    );

    return existingIds;
  } catch (error) {
    // If fetch fails (e.g., too many IDs), assume none exist and proceed
    logger.warn(
      `Could not check existing vectors: ${error.message}. Proceeding with upsert.`
    );
    return new Set();
  }
};

/**
 * Get Pinecone index statistics (total vector count, etc.)
 *
 * @returns {Promise<Object>} Index statistics
 */
export const getIndexStats = async () => {
  const index = await getPineconeIndex();
  const stats = await index.describeIndexStats();
  return stats;
};
