/**
 * RAG Service
 * Orchestrates the full Retrieval-Augmented Generation pipeline:
 *
 *   Query → Retrieve → Filter → Build Prompt → Generate → Parse → Respond
 *
 * This is the primary entry point called by the chat controller.
 * It coordinates the retrieval service, prompt templates, and LLM
 * to produce grounded, source-cited answers.
 */

import {
  retrieveRelevantChunks,
  formatRetrievedChunks,
} from "./retrieval.service.js";
import { generateResponse } from "./langchain.service.js";
import {
  SYSTEM_PROMPT,
  buildUserPrompt,
  formatContextForPrompt,
} from "../config/promptTemplates.js";
import { CONSTANTS } from "../config/constants.js";
import { logger } from "../utils/logger.js";

/**
 * Process a user query through the full RAG pipeline.
 *
 * Steps:
 *   1. Retrieve relevant chunks from Pinecone
 *   2. Format chunks for the prompt context window
 *   3. Build grounded prompt (system + context + query)
 *   4. Send to Gemini and get response
 *   5. Format sources for the API response
 *   6. Track latency for each stage
 *
 * @param {string} query - User's natural language question
 * @param {Object} options - Optional overrides
 * @param {number} options.topK - Number of chunks to retrieve
 * @param {number} options.threshold - Minimum similarity score
 * @returns {Promise<Object>} Complete RAG response with answer, sources, and timing
 */
export const processQuery = async (query, options = {}) => {
  const pipelineStart = Date.now();

  logger.info("═".repeat(50));
  logger.info(`🧠 RAG Pipeline started for: "${query.substring(0, 100)}"`);

  // ── 1. Retrieve relevant context ─────────────────────────────────
  const { chunks: rawChunks, queryTimeMs: retrievalMs } =
    await retrieveRelevantChunks(query, options);

  // ── 2. Check if we have sufficient context ───────────────────────
  if (rawChunks.length === 0) {
    logger.info("No relevant context found — returning fallback response");

    return buildFallbackResponse(query, pipelineStart, retrievalMs);
  }

  // ── 3. Format chunks for prompt and source citation ──────────────
  const formattedChunks = formatRetrievedChunks(rawChunks);
  const contextString = formatContextForPrompt(formattedChunks);

  logger.debug(
    `Context built: ${formattedChunks.length} chunks, ${contextString.length} chars`
  );

  // ── 4. Build the grounded prompt ─────────────────────────────────
  const userPrompt = buildUserPrompt(query, contextString);

  // ── 5. Generate response via Gemini ──────────────────────────────
  const { content: answer, latencyMs: generationMs } = await generateResponse(
    SYSTEM_PROMPT,
    userPrompt
  );

  // ── 6. Format sources for the API response ───────────────────────
  const sources = formatSources(formattedChunks);

  // ── 7. Compile latency metrics ───────────────────────────────────
  const totalMs = Date.now() - pipelineStart;

  const result = {
    success: true,
    answer,
    sources,
    retrievedChunks: formattedChunks.length,
    latency: {
      retrievalMs,
      generationMs,
      totalMs,
    },
  };

  logger.info("═".repeat(50));
  logger.info("📊 RAG PIPELINE COMPLETE");
  logger.info(`   Chunks retrieved:  ${formattedChunks.length}`);
  logger.info(`   Unique sources:    ${sources.length}`);
  logger.info(`   Retrieval time:    ${retrievalMs}ms`);
  logger.info(`   Generation time:   ${generationMs}ms`);
  logger.info(`   Total time:        ${totalMs}ms`);
  logger.info("═".repeat(50));

  return result;
};

/**
 * Build a fallback response when no relevant context is found.
 *
 * Instead of hallucinating, we return the pre-configured fallback
 * message with empty sources.
 *
 * @param {string} query - Original user query
 * @param {number} pipelineStart - Pipeline start timestamp
 * @param {number} retrievalMs - Time spent on retrieval
 * @returns {Object} Fallback response object
 */
const buildFallbackResponse = (query, pipelineStart, retrievalMs) => {
  return {
    success: true,
    answer: CONSTANTS.FALLBACK_MESSAGE,
    sources: [],
    retrievedChunks: 0,
    latency: {
      retrievalMs,
      generationMs: 0,
      totalMs: Date.now() - pipelineStart,
    },
  };
};

/**
 * Format retrieved chunks into clean source citation objects.
 *
 * Deduplicates by article title so the same article isn't listed
 * multiple times in the sources array (even if multiple chunks
 * from it were used). Keeps the highest score per article.
 *
 * @param {Array<{text: string, metadata: Object, score: number}>} chunks
 * @returns {Array<{title: string, source: string, publishedAt: string, snippet: string, score: number}>}
 */
const formatSources = (chunks) => {
  const sourceMap = new Map();

  for (const chunk of chunks) {
    const key = chunk.metadata.title || chunk.metadata.articleId;

    // Keep the highest-scoring chunk's data per unique article
    if (!sourceMap.has(key) || chunk.score > sourceMap.get(key).score) {
      sourceMap.set(key, {
        title: chunk.metadata.title,
        source: chunk.metadata.source,
        publishedAt: chunk.metadata.publishedAt
          ? new Date(chunk.metadata.publishedAt).toISOString()
          : null,
        snippet: truncateSnippet(chunk.text, 200),
        score: parseFloat(chunk.score.toFixed(4)),
      });
    }
  }

  // Sort by relevance score descending
  return Array.from(sourceMap.values()).sort((a, b) => b.score - a.score);
};

/**
 * Truncate text to a max length, breaking at word boundaries.
 *
 * @param {string} text - Text to truncate
 * @param {number} maxLen - Maximum character count
 * @returns {string} Truncated text with ellipsis if shortened
 */
const truncateSnippet = (text, maxLen = 200) => {
  if (!text || text.length <= maxLen) return text;

  // Cut at the last space before maxLen to avoid breaking words
  const truncated = text.substring(0, maxLen);
  const lastSpace = truncated.lastIndexOf(" ");

  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + "...";
};
