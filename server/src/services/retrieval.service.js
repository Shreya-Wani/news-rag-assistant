/**
 * Retrieval Service
 * Handles semantic search: query embedding → Pinecone search → filtering.
 *
 * This is the "R" in RAG — it converts a natural language query into
 * an embedding, searches the vector store, filters by similarity
 * threshold, deduplicates overlapping chunks, and returns the most
 * relevant context for the LLM.
 */

import { generateEmbedding } from "./embedding.service.js";
import { querySimilarVectors } from "./vectorStore.service.js";
import { CONSTANTS } from "../config/constants.js";
import { logger } from "../utils/logger.js";

/**
 * Retrieve relevant chunks for a user query.
 *
 * Pipeline:
 *   1. Embed the query text
 *   2. Search Pinecone for top-k similar vectors
 *   3. Filter by similarity threshold
 *   4. Deduplicate chunks from the same article region
 *   5. Trim to context window budget
 *
 * @param {string} query - User's natural language question
 * @param {Object} options - Override defaults
 * @param {number} options.topK - Number of candidates to fetch from Pinecone
 * @param {number} options.threshold - Minimum similarity score (0–1)
 * @param {Object} options.filter - Optional Pinecone metadata filter
 * @returns {Promise<{chunks: Array, queryTimeMs: number}>}
 */
export const retrieveRelevantChunks = async (query, options = {}) => {
  const startTime = Date.now();
  const topK = options.topK || CONSTANTS.PINECONE_TOP_K;
  const threshold = options.threshold || CONSTANTS.SIMILARITY_THRESHOLD;
  const filter = options.filter || {};

  logger.info(`🔍 Retrieving context for: "${query.substring(0, 80)}..."`);

  // ── 1. Embed the query ──────────────────────────────────────────
  const queryEmbedding = await generateEmbedding(query);

  logger.debug(
    `Query embedded (${queryEmbedding.length} dimensions)`
  );

  // ── 2. Search Pinecone for similar vectors ──────────────────────
  const rawMatches = await querySimilarVectors(queryEmbedding, topK, filter);

  logger.debug(
    `Pinecone returned ${rawMatches.length} raw matches`
  );

  if (rawMatches.length === 0) {
    logger.info("No matches found in Pinecone");
    return { chunks: [], queryTimeMs: Date.now() - startTime };
  }

  // ── 3. Apply similarity threshold filter ────────────────────────
  // Discard chunks that are semantically too distant from the query.
  // This prevents the LLM from being grounded on irrelevant material.
  const thresholdFiltered = rawMatches.filter(
    (match) => match.score >= threshold
  );

  logger.debug(
    `After threshold filter (>= ${threshold}): ${thresholdFiltered.length} chunks`
  );

  if (thresholdFiltered.length === 0) {
    logger.info(
      `All ${rawMatches.length} matches below similarity threshold ${threshold}`
    );
    return { chunks: [], queryTimeMs: Date.now() - startTime };
  }

  // ── 4. Deduplicate overlapping chunks ───────────────────────────
  // Two chunks from the same article with overlapping text are redundant.
  // We keep the highest-scoring chunk per (articleId, chunkIndex) pair.
  const deduplicated = deduplicateChunks(thresholdFiltered);

  logger.debug(
    `After deduplication: ${deduplicated.length} unique chunks`
  );

  // ── 5. Apply context window budget ─────────────────────────────
  // Trim to stay within MAX_CONTEXT_CHARS so we don't blow the LLM token limit.
  const budgeted = applyContextBudget(deduplicated);

  const queryTimeMs = Date.now() - startTime;

  logger.info(
    `✅ Retrieved ${budgeted.length} chunks in ${queryTimeMs}ms ` +
      `(scores: ${budgeted.map((c) => c.score.toFixed(2)).join(", ")})`
  );

  return { chunks: budgeted, queryTimeMs };
};

/**
 * Remove duplicate chunks from the same article region.
 *
 * Duplicates are identified by the combination of (articleId, chunkIndex).
 * When the same article+chunk appears multiple times (e.g., if the index
 * was accidentally double-ingested), we keep only the highest-scoring one.
 *
 * @param {Array} matches - Pinecone match objects
 * @returns {Array} Deduplicated matches
 */
const deduplicateChunks = (matches) => {
  const seen = new Map();

  for (const match of matches) {
    const meta = match.metadata || {};
    // Build a unique key per logical chunk
    const key = `${meta.articleId || match.id}-${meta.chunkIndex ?? ""}`;

    if (!seen.has(key) || match.score > seen.get(key).score) {
      seen.set(key, match);
    }
  }

  return Array.from(seen.values());
};

/**
 * Trim context to fit within the token-efficient character budget.
 *
 * Chunks are already sorted by relevance (highest score first).
 * We greedily add chunks until the cumulative character count
 * exceeds MAX_CONTEXT_CHARS, then stop.
 *
 * @param {Array} chunks - Sorted, deduplicated chunks
 * @returns {Array} Budget-constrained chunks
 */
const applyContextBudget = (chunks) => {
  const maxChars = CONSTANTS.MAX_CONTEXT_CHARS;
  const result = [];
  let totalChars = 0;

  for (const chunk of chunks) {
    const text = chunk.metadata?.text || "";
    if (totalChars + text.length > maxChars && result.length > 0) {
      // Already have at least one chunk — stop to stay within budget
      break;
    }
    totalChars += text.length;
    result.push(chunk);
  }

  return result;
};

/**
 * Format raw Pinecone matches into a clean chunk array
 * suitable for downstream prompt building and source citation.
 *
 * @param {Array} matches - Raw Pinecone match objects
 * @returns {Array<{text: string, metadata: Object, score: number}>}
 */
export const formatRetrievedChunks = (matches) => {
  return matches.map((match) => ({
    text: match.metadata?.text || "",
    metadata: {
      title: match.metadata?.title || "Untitled",
      source: match.metadata?.source || "Unknown",
      publishedAt: match.metadata?.publishedAt || null,
      articleId: match.metadata?.articleId || null,
      chunkIndex: match.metadata?.chunkIndex ?? null,
    },
    score: match.score || 0,
  }));
};
