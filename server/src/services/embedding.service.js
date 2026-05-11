/**
 * Embedding Service
 * Generates vector embeddings using HuggingFace Inference API via LangChain.
 *
 * Uses the sentence-transformers/all-MiniLM-L6-v2 model by default,
 * which produces 384-dimensional embeddings optimized for semantic search.
 */

import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { CONSTANTS } from "../config/constants.js";
import { logger } from "../utils/logger.js";

// Singleton embedding model instance
let embeddingModel = null;

/**
 * Initialize or return the cached HuggingFace embedding model.
 *
 * The model is lazily initialized on first use and reused for all
 * subsequent calls to avoid re-creating the HTTP client.
 *
 * @returns {HuggingFaceInferenceEmbeddings} Embedding model instance
 */
export const getEmbeddingModel = () => {
  if (!embeddingModel) {
    if (!process.env.HUGGINGFACE_API_KEY) {
      throw new Error(
        "HUGGINGFACE_API_KEY is not set in environment variables"
      );
    }

    embeddingModel = new HuggingFaceInferenceEmbeddings({
      apiKey: process.env.HUGGINGFACE_API_KEY,
      model: CONSTANTS.EMBEDDING_MODEL,
    });

    logger.info(
      `✅ HuggingFace embedding model initialized (${CONSTANTS.EMBEDDING_MODEL})`
    );
  }

  return embeddingModel;
};

/**
 * Generate an embedding vector for a single text string.
 *
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} Embedding vector (384 dimensions for MiniLM-L6-v2)
 */
export const generateEmbedding = async (text) => {
  const model = getEmbeddingModel();
  const embedding = await model.embedQuery(text);
  return embedding;
};

/**
 * Generate embeddings for an array of texts.
 *
 * Uses the batch endpoint for efficiency — a single API call
 * embeds all texts instead of one call per text.
 *
 * @param {string[]} texts - Array of texts to embed
 * @returns {Promise<number[][]>} Array of embedding vectors
 */
export const generateBatchEmbeddings = async (texts) => {
  if (!texts || texts.length === 0) return [];

  const model = getEmbeddingModel();

  logger.debug(`Generating embeddings for ${texts.length} texts...`);

  const embeddings = await model.embedDocuments(texts);

  logger.debug(
    `Generated ${embeddings.length} embeddings (dim=${embeddings[0]?.length})`
  );

  return embeddings;
};
