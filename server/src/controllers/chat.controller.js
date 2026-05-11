/**
 * Chat Controller
 * Handles the POST /api/chat endpoint — the primary user-facing
 * interface for the NewsMind AI RAG chatbot.
 *
 * Also provides session management endpoints for future multi-turn
 * conversation support.
 */

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { processQuery } from "../services/rag.service.js";
import { CONSTANTS } from "../config/constants.js";
import { logger } from "../utils/logger.js";

/**
 * @desc    Send a question to the RAG pipeline and get an AI answer
 * @route   POST /api/chat
 * @access  Public
 *
 * Expected body:
 *   {
 *     "question": "What happened with SpaceX recently?",
 *     "topK": 5,        // optional — default 5
 *     "threshold": 0.75  // optional — default 0.75
 *   }
 *
 * Response:
 *   {
 *     "success": true,
 *     "answer": "...",
 *     "sources": [...],
 *     "retrievedChunks": 5,
 *     "latency": { retrievalMs, generationMs, totalMs }
 *   }
 */
export const chat = asyncHandler(async (req, res) => {
  const { question, query, topK, threshold } = req.body;

  // Accept either "question" or "query" field
  const userQuestion = question || query;

  // ── Validate input ─────────────────────────────────────────────
  if (!userQuestion || typeof userQuestion !== "string") {
    throw new ApiError(400, "A 'question' field (string) is required in the request body");
  }

  const trimmedQuestion = userQuestion.trim();

  if (trimmedQuestion.length === 0) {
    throw new ApiError(400, "Question cannot be empty");
  }

  if (trimmedQuestion.length > CONSTANTS.MAX_MESSAGE_LENGTH) {
    throw new ApiError(
      400,
      `Question exceeds maximum length of ${CONSTANTS.MAX_MESSAGE_LENGTH} characters`
    );
  }

  logger.info(`💬 Chat request: "${trimmedQuestion.substring(0, 80)}..."`);

  // ── Run RAG pipeline ───────────────────────────────────────────
  const result = await processQuery(trimmedQuestion, {
    topK: topK || CONSTANTS.PINECONE_TOP_K,
    threshold: threshold || CONSTANTS.SIMILARITY_THRESHOLD,
  });

  // ── Return response ────────────────────────────────────────────
  res.status(200).json(
    new ApiResponse(200, result, "Chat response generated successfully")
  );
});

/**
 * @desc    Send a message to the AI chatbot (legacy endpoint)
 * @route   POST /api/v1/chat/message
 * @access  Public
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const { message, question, query } = req.body;
  const userQuestion = message || question || query;

  if (!userQuestion || typeof userQuestion !== "string" || userQuestion.trim().length === 0) {
    throw new ApiError(400, "A 'message' field (string) is required");
  }

  const result = await processQuery(userQuestion.trim());

  res.status(200).json(
    new ApiResponse(200, result, "Message processed successfully")
  );
});

/**
 * @desc    Get chat history by session ID
 * @route   GET /api/v1/chat/history/:sessionId
 * @access  Public
 */
export const getChatHistory = asyncHandler(async (req, res) => {
  // TODO: Implement chat history retrieval from MongoDB
  res.status(200).json(
    new ApiResponse(200, { history: [] }, "Chat history retrieved")
  );
});

/**
 * @desc    Create a new chat session
 * @route   POST /api/v1/chat/session
 * @access  Public
 */
export const createSession = asyncHandler(async (req, res) => {
  // TODO: Implement session creation in MongoDB
  res.status(201).json(
    new ApiResponse(201, { sessionId: null }, "Session created")
  );
});

/**
 * @desc    Delete a chat session
 * @route   DELETE /api/v1/chat/session/:sessionId
 * @access  Public
 */
export const deleteSession = asyncHandler(async (req, res) => {
  // TODO: Implement session deletion from MongoDB
  res.status(200).json(
    new ApiResponse(200, null, "Session deleted")
  );
});
