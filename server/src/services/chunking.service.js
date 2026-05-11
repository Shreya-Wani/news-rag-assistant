/**
 * Chunking Service
 * Handles text splitting using LangChain's RecursiveCharacterTextSplitter.
 *
 * Responsible for breaking article content into smaller, semantically
 * meaningful chunks that can be individually embedded and stored.
 */

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { CONSTANTS } from "../config/constants.js";
import { logger } from "../utils/logger.js";

// Singleton splitter instance — reused across calls for consistency
let splitterInstance = null;

/**
 * Initialize or return the cached text splitter.
 * Using a singleton ensures every article is split with identical parameters.
 *
 * @returns {RecursiveCharacterTextSplitter}
 */
const getSplitter = () => {
  if (!splitterInstance) {
    splitterInstance = new RecursiveCharacterTextSplitter({
      chunkSize: CONSTANTS.CHUNK_SIZE,
      chunkOverlap: CONSTANTS.CHUNK_OVERLAP,
      // Separator priority: paragraphs → sentences → words → characters
      separators: ["\n\n", "\n", ". ", " ", ""],
    });

    logger.info(
      `✅ Text splitter initialized (chunkSize=${CONSTANTS.CHUNK_SIZE}, overlap=${CONSTANTS.CHUNK_OVERLAP})`
    );
  }

  return splitterInstance;
};

/**
 * Chunk a single article's content into smaller text segments.
 *
 * Each chunk receives metadata so it can be traced back to the
 * original article after retrieval from the vector store.
 *
 * @param {Object} article - Article object with title, content, source, publishedAt, _id
 * @returns {Array<{text: string, metadata: Object}>} Array of chunks with metadata
 */
export const chunkArticle = async (article) => {
  const splitter = getSplitter();

  // Prepend title to content so the LLM has context even in isolated chunks
  const fullText = `${article.title}\n\n${article.content}`;

  const docs = await splitter.createDocuments([fullText]);

  // Attach article-level metadata to each chunk
  const chunks = docs.map((doc, index) => ({
    text: doc.pageContent,
    metadata: {
      title: article.title,
      source: article.source,
      publishedAt: article.publishedAt
        ? new Date(article.publishedAt).toISOString()
        : new Date().toISOString(),
      articleId: article._id ? article._id.toString() : article.id || "",
      chunkIndex: index,
    },
  }));

  logger.debug(
    `Chunked article "${article.title}" → ${chunks.length} chunks`
  );

  return chunks;
};

/**
 * Chunk multiple articles in sequence.
 *
 * @param {Array<Object>} articles - Array of article objects
 * @returns {Array<{text: string, metadata: Object}>} Flat array of all chunks
 */
export const chunkArticles = async (articles) => {
  const allChunks = [];

  for (const article of articles) {
    try {
      const chunks = await chunkArticle(article);
      allChunks.push(...chunks);
    } catch (error) {
      logger.error(
        `Failed to chunk article "${article.title}": ${error.message}`
      );
      // Continue processing remaining articles
    }
  }

  logger.info(
    `Chunked ${articles.length} articles → ${allChunks.length} total chunks`
  );

  return allChunks;
};
