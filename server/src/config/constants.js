/**
 * Application-wide constants
 */

export const CONSTANTS = {
  // API Versioning
  API_VERSION: "v1",

  // Pagination defaults
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,

  // AI Configuration
  GEMINI_MODEL: "gemini-2.0-flash",
  MAX_TOKENS: 2048,
  TEMPERATURE: 0.7,

  // HuggingFace Embedding Configuration
  EMBEDDING_MODEL: "sentence-transformers/all-MiniLM-L6-v2",

  // Chunking Configuration
  CHUNK_SIZE: 800,
  CHUNK_OVERLAP: 100,

  // Pinecone
  PINECONE_TOP_K: 5,
  PINECONE_NAMESPACE: "news-articles",
  PINECONE_BATCH_SIZE: 100, // Max vectors per upsert batch

  // Ingestion
  INGESTION_BATCH_SIZE: 10, // Articles to process concurrently
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,

  // Chat
  MAX_CHAT_HISTORY: 20,
  MAX_MESSAGE_LENGTH: 5000,
};
