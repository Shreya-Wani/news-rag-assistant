/**
 * Application Constants
 * Centralized configuration values used across services.
 *
 * Environment variables override defaults where applicable.
 */

export const CONSTANTS = {
  // ─── Groq / LLM ─────────────────────────────────────────────
  GROQ_MODEL: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
  TEMPERATURE: parseFloat(process.env.LLM_TEMPERATURE) || 0.3,
  MAX_TOKENS: parseInt(process.env.MAX_TOKENS) || 2048,

  // ─── Embeddings ─────────────────────────────────────────────
  EMBEDDING_MODEL: process.env.EMBEDDING_MODEL || "sentence-transformers/all-MiniLM-L6-v2",

  // ─── Chunking ───────────────────────────────────────────────
  CHUNK_SIZE: parseInt(process.env.CHUNK_SIZE) || 1000,
  CHUNK_OVERLAP: parseInt(process.env.CHUNK_OVERLAP) || 200,

  // ─── Pinecone ───────────────────────────────────────────────
  PINECONE_NAMESPACE: process.env.PINECONE_NAMESPACE || "news-articles",
  PINECONE_BATCH_SIZE: parseInt(process.env.PINECONE_BATCH_SIZE) || 100,
  PINECONE_TOP_K: parseInt(process.env.PINECONE_TOP_K) || 5,

  // ─── Retrieval ──────────────────────────────────────────────
  SIMILARITY_THRESHOLD: parseFloat(process.env.SIMILARITY_THRESHOLD) || 0.3,
  MAX_CONTEXT_CHARS: parseInt(process.env.MAX_CONTEXT_CHARS) || 8000,

  // ─── Ingestion ──────────────────────────────────────────────
  INGESTION_BATCH_SIZE: parseInt(process.env.INGESTION_BATCH_SIZE) || 50,
  MAX_RETRIES: parseInt(process.env.MAX_RETRIES) || 3,
  RETRY_DELAY_MS: parseInt(process.env.RETRY_DELAY_MS) || 1000,

  // ─── Rate Limiting ──────────────────────────────────────────
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,

  // ─── Message Limits ─────────────────────────────────────────
  MAX_MESSAGE_LENGTH: parseInt(process.env.MAX_MESSAGE_LENGTH) || 2000,
  MAX_RESPONSE_LENGTH: parseInt(process.env.MAX_RESPONSE_LENGTH) || 10000,

  // ─── Fallbacks ──────────────────────────────────────────────
  FALLBACK_MESSAGE:
    "I'm sorry, I couldn't find relevant information to answer your question. Please try rephrasing or asking about a different topic.",

  // ─── Analysis ───────────────────────────────────────────────
  ANALYSIS_MAX_RETRIES: parseInt(process.env.ANALYSIS_MAX_RETRIES) || 2,
  ANALYSIS_FALLBACK: {
    detailedExplanation: "Unable to generate a detailed analysis at this time.",
    keyInsights: ["Analysis could not be completed."],
    simplifiedSummary: "The analysis service encountered an issue.",
    additionalContext: "Please try again later.",
    followUpQuestions: ["Could you try rephrasing your request?"],
  },
};
