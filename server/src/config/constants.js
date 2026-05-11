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
  EMBEDDING_MODEL: "text-embedding-004",
  MAX_TOKENS: 2048,
  TEMPERATURE: 0.7,

  // Pinecone
  PINECONE_TOP_K: 5,
  PINECONE_NAMESPACE: "news-articles",

  // Chat
  MAX_CHAT_HISTORY: 20,
  MAX_MESSAGE_LENGTH: 5000,
};
