import { Pinecone } from "@pinecone-database/pinecone";
import { logger } from "../utils/logger.js";

let pineconeClient = null;

/**
 * Initialize Pinecone client
 * @returns {Pinecone} Pinecone client instance
 */
export const initPinecone = async () => {
  try {
    if (pineconeClient) return pineconeClient;

    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    logger.info("✅ Pinecone client initialized");
    return pineconeClient;
  } catch (error) {
    logger.error("❌ Pinecone initialization failed:", error.message);
    throw error;
  }
};

/**
 * Get Pinecone index
 * @returns {import("@pinecone-database/pinecone").Index} Pinecone index
 */
export const getPineconeIndex = async () => {
  const client = await initPinecone();
  return client.index(process.env.PINECONE_INDEX);
};
