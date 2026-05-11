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

  // AI Configuration — Gemini LLM
  GEMINI_MODEL: "gemini-2.0-flash",
  MAX_TOKENS: 2048,
  TEMPERATURE: 0.4, // Lower temperature for factual RAG answers

  // HuggingFace Embedding Configuration
  EMBEDDING_MODEL: "sentence-transformers/all-MiniLM-L6-v2",

  // Chunking Configuration
  CHUNK_SIZE: 800,
  CHUNK_OVERLAP: 100,

  // Pinecone
  PINECONE_TOP_K: 5,
  PINECONE_NAMESPACE: "news-articles",
  PINECONE_BATCH_SIZE: 100,

  // RAG Retrieval
  SIMILARITY_THRESHOLD: 0.75,
  MAX_CONTEXT_CHARS: 6000,   // Token-efficient context window cap
  FALLBACK_MESSAGE:
    "I could not find relevant information in the dataset. Please try rephrasing your question or ask about a different topic covered in the news.",

  // Ingestion
  INGESTION_BATCH_SIZE: 10,
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,

  // Chat
  MAX_CHAT_HISTORY: 20,
  MAX_MESSAGE_LENGTH: 5000,

  // Analysis
  ANALYSIS_TEMPERATURE: 0.6, // Slightly higher for creative insights
  ANALYSIS_MAX_TOKENS: 4096,
  ANALYSIS_MAX_RETRIES: 2,
  MAX_RESPONSE_LENGTH: 10000, // Max chars for the response to analyze
  ANALYSIS_FALLBACK: {
    detailedExplanation: "Unable to generate a detailed explanation at this time.",
    keyInsights: ["Analysis could not be completed. Please try again."],
    simplifiedSummary: "The analysis service encountered an issue processing this response.",
    additionalContext: "",
    followUpQuestions: ["Could you try submitting the response again?"],
  },
};
