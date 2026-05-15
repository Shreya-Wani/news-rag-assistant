/**
 * Analysis Service
 * Orchestrates the "Analyze with AI" multi-step workflow:
 *
 *   Chatbot Response → Build Prompt → Groq Generation → Parse JSON → Validate → Return
 *
 * This is the second-stage AI pipeline: after the RAG chatbot produces
 * a grounded response, the user can request a deeper analysis that
 * extracts insights, simplifies content, and suggests follow-ups.
 */

import { generateResponse } from "./langchain.service.js";
import {
  ANALYSIS_SYSTEM_PROMPT,
  buildAnalysisPrompt,
} from "../config/promptTemplates.js";
import { parseAnalysisJSON } from "../utils/jsonParser.js";
import { CONSTANTS } from "../config/constants.js";
import { logger } from "../utils/logger.js";

/**
 * Analyze a chatbot response through the AI analysis pipeline.
 *
 * Steps:
 *   1. Validate the input response
 *   2. Build the analysis prompt
 *   3. Send to Groq with analysis-optimized settings
 *   4. Parse the structured JSON output
 *   5. Retry on parse failure (up to ANALYSIS_MAX_RETRIES)
 *   6. Return validated analysis or fallback
 *
 * @param {string} response - The AI chatbot response to analyze
 * @returns {Promise<Object>} Analysis result with latency tracking
 */
export const analyzeResponse = async (response) => {
  const pipelineStart = Date.now();

  logger.info("═".repeat(50));
  logger.info(`🔬 Analysis pipeline started (${response.length} chars input)`);

  // ── Build the analysis prompt ────────────────────────────────
  const userPrompt = buildAnalysisPrompt(response);

  // ── Attempt generation with retry ────────────────────────────
  const maxRetries = CONSTANTS.ANALYSIS_MAX_RETRIES;
  let lastError = null;
  let analysis = null;
  let generationMs = 0;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`📤 Analysis attempt ${attempt}/${maxRetries}...`);

      // Call Groq with the analysis prompt
      const { content: rawContent, latencyMs } = await generateResponse(
        ANALYSIS_SYSTEM_PROMPT,
        userPrompt
      );

      generationMs += latencyMs;

      logger.debug(
        `Raw Groq output (${rawContent.length} chars, ${latencyMs}ms)`
      );

      // ── Parse the structured JSON response ──────────────────
      const parseResult = parseAnalysisJSON(rawContent);

      if (parseResult.success) {
        analysis = parseResult.data;
        logger.info(`✅ Analysis JSON parsed successfully on attempt ${attempt}`);
        break;
      }

      // Parse failed — log and retry
      lastError = parseResult.error;
      logger.warn(
        `JSON parse failed on attempt ${attempt}: ${parseResult.error}`
      );

      // Wait briefly before retry to avoid rate limits
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 500));
      }
    } catch (error) {
      lastError = error.message;
      logger.error(`Analysis attempt ${attempt} failed: ${error.message}`);

      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }

  // ── Use fallback if all attempts failed ──────────────────────
  if (!analysis) {
    logger.warn("All analysis attempts failed — using fallback response");
    analysis = { ...CONSTANTS.ANALYSIS_FALLBACK };
  }

  // ── Compile latency metrics ──────────────────────────────────
  const totalMs = Date.now() - pipelineStart;

  const result = {
    success: !!analysis && analysis !== CONSTANTS.ANALYSIS_FALLBACK,
    analysis,
    latency: {
      generationMs,
      totalMs,
    },
  };

  logger.info("═".repeat(50));
  logger.info("📊 ANALYSIS PIPELINE COMPLETE");
  logger.info(`   Explanation length: ${analysis.detailedExplanation?.length || 0} chars`);
  logger.info(`   Key insights:       ${analysis.keyInsights?.length || 0}`);
  logger.info(`   Follow-up Qs:       ${analysis.followUpQuestions?.length || 0}`);
  logger.info(`   Generation time:    ${generationMs}ms`);
  logger.info(`   Total time:         ${totalMs}ms`);
  logger.info("═".repeat(50));

  return result;
};
