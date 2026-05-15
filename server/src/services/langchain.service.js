/**
 * LangChain Service
 * Handles LLM interactions using LangChain + Google Gemini.
 *
 * Provides a singleton Gemini chat model and a method to invoke it
 * with system + user messages. Used by the RAG service to generate
 * grounded responses from retrieved context.
 */

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { CONSTANTS } from "../config/constants.js";
import { logger } from "../utils/logger.js";

// Singleton LLM instance
let llmInstance = null;

/**
 * Initialize or return the cached Gemini LLM.
 *
 * Lazy-loads on first call and reuses thereafter. The model is
 * configured with a low temperature for factual, deterministic
 * RAG responses.
 *
 * @returns {ChatGoogleGenerativeAI} LLM instance
 */
export const getLLM = () => {
  if (!llmInstance) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    llmInstance = new ChatGoogleGenerativeAI({
      model: CONSTANTS.GEMINI_MODEL,
      temperature: CONSTANTS.TEMPERATURE,
      maxOutputTokens: CONSTANTS.MAX_TOKENS,
      apiKey: process.env.GEMINI_API_KEY,
    });

    logger.info(
      `✅ Gemini LLM initialized (model=${CONSTANTS.GEMINI_MODEL}, temp=${CONSTANTS.TEMPERATURE})`
    );
  }

  return llmInstance;
};

/**
 * Generate a response from Gemini using system + user messages.
 *
 * This is a low-level method — the RAG service builds the prompt
 * and calls this function to get the LLM's output.
 *
 * @param {string} systemPrompt - System-level instruction
 * @param {string} userPrompt - User message with embedded context
 * @returns {Promise<{content: string, latencyMs: number}>}
 */
export const generateResponse = async (systemPrompt, userPrompt) => {
  const llm = getLLM();
  const startTime = Date.now();

  logger.debug("Sending prompt to Gemini...");

  try {
    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt),
    ]);

    const latencyMs = Date.now() - startTime;
    const content =
      typeof response.content === "string"
        ? response.content
        : String(response.content);

    logger.info(`✅ Gemini responded in ${latencyMs}ms (${content.length} chars)`);

    return { content, latencyMs };
  } catch (error) {
    const latencyMs = Date.now() - startTime;

    // Handle Gemini API quota/rate limit errors gracefully
    if (error.message?.includes("429") || error.message?.includes("quota") || error.message?.includes("RESOURCE_EXHAUSTED")) {
      logger.warn(`⚠️ Gemini API quota exceeded after ${latencyMs}ms`);
      return {
        content: "I found relevant news articles, but the AI service is temporarily rate-limited. Please try again in a minute.",
        latencyMs,
      };
    }

    // Re-throw other errors
    throw error;
  }
};
