/**
 * Analysis Controller
 * Handles the POST /api/analyze endpoint — the "Analyze with AI"
 * second-stage workflow that provides deeper analysis of chatbot responses.
 */

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { analyzeResponse } from "../services/analysis.service.js";
import { CONSTANTS } from "../config/constants.js";
import { logger } from "../utils/logger.js";

/**
 * @desc    Analyze an AI chatbot response with deeper AI analysis
 * @route   POST /api/analyze
 * @access  Public
 *
 * Expected body:
 *   {
 *     "response": "The AI-generated chatbot response text..."
 *   }
 *
 * Response:
 *   {
 *     "success": true,
 *     "data": {
 *       "success": true,
 *       "analysis": {
 *         "detailedExplanation": "...",
 *         "keyInsights": ["...", "..."],
 *         "simplifiedSummary": "...",
 *         "additionalContext": "...",
 *         "followUpQuestions": ["...", "..."]
 *       },
 *       "latency": { "generationMs": 1200, "totalMs": 1450 }
 *     }
 *   }
 */
export const analyze = asyncHandler(async (req, res) => {
  const { response, answer, text } = req.body;

  // Accept "response", "answer", or "text" for flexibility
  const inputText = response || answer || text;

  // ── Validate input ─────────────────────────────────────────────
  if (!inputText || typeof inputText !== "string") {
    throw new ApiError(
      400,
      "A 'response' field (string) is required in the request body"
    );
  }

  const trimmedInput = inputText.trim();

  if (trimmedInput.length === 0) {
    throw new ApiError(400, "Response text cannot be empty");
  }

  if (trimmedInput.length > CONSTANTS.MAX_RESPONSE_LENGTH) {
    throw new ApiError(
      400,
      `Response exceeds maximum length of ${CONSTANTS.MAX_RESPONSE_LENGTH} characters`
    );
  }

  // Reject the fallback message — there's nothing meaningful to analyze
  if (trimmedInput === CONSTANTS.FALLBACK_MESSAGE) {
    throw new ApiError(
      400,
      "Cannot analyze a fallback response. Please provide a substantive AI response."
    );
  }

  logger.info(
    `🔬 Analyze request: "${trimmedInput.substring(0, 80)}..." (${trimmedInput.length} chars)`
  );

  // ── Run analysis pipeline ──────────────────────────────────────
  const result = await analyzeResponse(trimmedInput);

  // ── Return response ────────────────────────────────────────────
  res.status(200).json(
    new ApiResponse(
      200,
      result,
      result.success
        ? "Analysis completed successfully"
        : "Analysis completed with fallback — some fields may be incomplete"
    )
  );
});
