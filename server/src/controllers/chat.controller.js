import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * @desc    Send a message to the AI chatbot
 * @route   POST /api/v1/chat/message
 * @access  Public
 */
export const sendMessage = asyncHandler(async (req, res) => {
  // TODO: Implement RAG-based chat logic
  res.status(200).json(
    new ApiResponse(200, { message: "Chat endpoint ready" }, "Success")
  );
});

/**
 * @desc    Get chat history by session ID
 * @route   GET /api/v1/chat/history/:sessionId
 * @access  Public
 */
export const getChatHistory = asyncHandler(async (req, res) => {
  // TODO: Implement chat history retrieval
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
  // TODO: Implement session creation
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
  // TODO: Implement session deletion
  res.status(200).json(
    new ApiResponse(200, null, "Session deleted")
  );
});
