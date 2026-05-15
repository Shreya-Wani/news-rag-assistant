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
import Chat from "../models/chat.model.js";
import crypto from "crypto";

/**
 * @desc    Send a question to the RAG pipeline and get an AI answer
 * @route   POST /api/chat
 * @access  Public
 */
export const chat = asyncHandler(async (req, res) => {
  const { question, query, topK, threshold, sessionId } = req.body;

  const userQuestion = question || query;

  if (!userQuestion || typeof userQuestion !== "string") {
    throw new ApiError(400, "A 'question' field (string) is required");
  }

  const trimmedQuestion = userQuestion.trim();
  if (trimmedQuestion.length === 0) {
    throw new ApiError(400, "Question cannot be empty");
  }

  if (trimmedQuestion.length > CONSTANTS.MAX_MESSAGE_LENGTH) {
    throw new ApiError(400, `Question exceeds maximum length of ${CONSTANTS.MAX_MESSAGE_LENGTH} characters`);
  }

  logger.info(`💬 Chat request: "${trimmedQuestion.substring(0, 80)}..."`);

  // Run RAG pipeline
  const result = await processQuery(trimmedQuestion, {
    topK: topK || CONSTANTS.PINECONE_TOP_K,
    threshold: threshold || CONSTANTS.SIMILARITY_THRESHOLD,
  });

  // Save to history if sessionId is provided
  if (sessionId) {
    try {
      const chatDoc = await Chat.findOne({ sessionId, isActive: true });
      if (chatDoc) {
        // Save user message
        chatDoc.messages.push({
          role: "user",
          content: trimmedQuestion
        });
        
        // Save assistant message
        chatDoc.messages.push({
          role: "assistant",
          content: result.answer,
          metadata: {
            sources: result.sources.map(s => s.title)
          }
        });

        // Update title if it's the first message
        if (chatDoc.messages.length <= 2 && chatDoc.title === "New Chat") {
          chatDoc.title = trimmedQuestion.substring(0, 40) + (trimmedQuestion.length > 40 ? "..." : "");
        }

        await chatDoc.save();
      }
    } catch (err) {
      logger.error(`Error saving chat history: ${err.message}`);
      // Continue returning response even if saving history fails
    }
  }

  res.status(200).json(new ApiResponse(200, result, "Chat response generated successfully"));
});

/**
 * @desc    Send a message to the AI chatbot (legacy endpoint)
 * @route   POST /api/v1/chat/message
 * @access  Public
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const { message, question, query, sessionId } = req.body;
  const userQuestion = message || question || query;

  if (!userQuestion || typeof userQuestion !== "string" || userQuestion.trim().length === 0) {
    throw new ApiError(400, "A 'message' field (string) is required");
  }

  const result = await processQuery(userQuestion.trim());

  if (sessionId) {
    try {
      const chatDoc = await Chat.findOne({ sessionId, isActive: true });
      if (chatDoc) {
        chatDoc.messages.push({ role: "user", content: userQuestion.trim() });
        chatDoc.messages.push({ role: "assistant", content: result.answer });
        if (chatDoc.messages.length <= 2 && chatDoc.title === "New Chat") {
          chatDoc.title = userQuestion.trim().substring(0, 40) + "...";
        }
        await chatDoc.save();
      }
    } catch (err) {
      logger.error(`Error saving history: ${err.message}`);
    }
  }

  res.status(200).json(new ApiResponse(200, result, "Message processed successfully"));
});

/**
 * @desc    Get all chat sessions
 * @route   GET /api/v1/chat/sessions
 * @access  Public
 */
export const getSessions = asyncHandler(async (req, res) => {
  const sessions = await Chat.find({ isActive: true })
    .select("sessionId title createdAt updatedAt")
    .sort({ updatedAt: -1 });

  res.status(200).json(new ApiResponse(200, { sessions }, "Sessions retrieved"));
});

/**
 * @desc    Get chat history by session ID
 * @route   GET /api/v1/chat/history/:sessionId
 * @access  Public
 */
export const getChatHistory = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const chatDoc = await Chat.findOne({ sessionId, isActive: true });

  if (!chatDoc) {
    return res.status(200).json(new ApiResponse(200, { history: [] }, "No history found for session"));
  }

  res.status(200).json(new ApiResponse(200, { history: chatDoc.messages }, "Chat history retrieved"));
});

/**
 * @desc    Create a new chat session
 * @route   POST /api/v1/chat/session
 * @access  Public
 */
export const createSession = asyncHandler(async (req, res) => {
  const sessionId = crypto.randomUUID();
  
  const newChat = await Chat.create({
    sessionId,
    messages: [],
    title: "New Chat",
  });

  res.status(201).json(new ApiResponse(201, { sessionId: newChat.sessionId }, "Session created"));
});

/**
 * @desc    Delete a chat session
 * @route   DELETE /api/v1/chat/session/:sessionId
 * @access  Public
 */
export const deleteSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  
  const chatDoc = await Chat.findOneAndUpdate(
    { sessionId },
    { isActive: false },
    { new: true }
  );

  if (!chatDoc) {
    throw new ApiError(404, "Session not found");
  }

  res.status(200).json(new ApiResponse(200, null, "Session deleted"));
});
