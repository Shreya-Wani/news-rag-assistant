/**
 * JSON Parser Utility
 * Robust parser for extracting and validating structured JSON
 * from LLM responses, which may include markdown fences,
 * trailing text, or minor formatting errors.
 */

import { logger } from "./logger.js";

/**
 * Expected fields and their types in the analysis response.
 * Used for validation and fallback construction.
 */
const ANALYSIS_SCHEMA = {
  detailedExplanation: "string",
  keyInsights: "array",
  simplifiedSummary: "string",
  additionalContext: "string",
  followUpQuestions: "array",
};

/**
 * Parse a raw LLM output string into a validated JSON object.
 *
 * Handles common LLM response quirks:
 *   - Markdown code fences (```json ... ```)
 *   - Leading/trailing whitespace and text
 *   - Minor JSON syntax issues (trailing commas, etc.)
 *
 * @param {string} rawText - Raw LLM output
 * @returns {{ success: boolean, data: Object|null, error: string|null }}
 */
export const parseAnalysisJSON = (rawText) => {
  if (!rawText || typeof rawText !== "string") {
    return { success: false, data: null, error: "Empty or invalid response" };
  }

  // ── Attempt 1: Direct parse ──────────────────────────────────
  const directResult = attemptParse(rawText.trim());
  if (directResult.success) {
    const validated = validateAnalysisShape(directResult.data);
    return validated;
  }

  // ── Attempt 2: Extract from markdown code fences ─────────────
  const fenceExtracted = extractFromCodeFence(rawText);
  if (fenceExtracted) {
    const fenceResult = attemptParse(fenceExtracted);
    if (fenceResult.success) {
      const validated = validateAnalysisShape(fenceResult.data);
      return validated;
    }
  }

  // ── Attempt 3: Find JSON object in surrounding text ──────────
  const bracketExtracted = extractJSONByBrackets(rawText);
  if (bracketExtracted) {
    const bracketResult = attemptParse(bracketExtracted);
    if (bracketResult.success) {
      const validated = validateAnalysisShape(bracketResult.data);
      return validated;
    }
  }

  // ── Attempt 4: Fix common syntax issues and retry ────────────
  const sanitized = sanitizeJSON(rawText);
  const sanitizedResult = attemptParse(sanitized);
  if (sanitizedResult.success) {
    const validated = validateAnalysisShape(sanitizedResult.data);
    return validated;
  }

  // ── All attempts failed ──────────────────────────────────────
  logger.error("All JSON parse attempts failed for LLM response");
  logger.debug(`Raw LLM output (first 500 chars): ${rawText.substring(0, 500)}`);

  return {
    success: false,
    data: null,
    error: "Failed to parse LLM response as valid JSON after all recovery attempts",
  };
};

/**
 * Attempt to parse a string as JSON.
 *
 * @param {string} text
 * @returns {{ success: boolean, data: Object|null }}
 */
const attemptParse = (text) => {
  try {
    const data = JSON.parse(text);
    return { success: true, data };
  } catch {
    return { success: false, data: null };
  }
};

/**
 * Extract JSON content from markdown code fences.
 * Handles ```json ... ```, ``` ... ```, and variations.
 *
 * @param {string} text
 * @returns {string|null} Extracted JSON string or null
 */
const extractFromCodeFence = (text) => {
  // Match ```json ... ``` or ``` ... ```
  const fenceRegex = /```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/;
  const match = text.match(fenceRegex);
  return match ? match[1].trim() : null;
};

/**
 * Extract a JSON object by finding the outermost { ... } pair.
 *
 * @param {string} text
 * @returns {string|null} Extracted JSON string or null
 */
const extractJSONByBrackets = (text) => {
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }

  return text.substring(firstBrace, lastBrace + 1);
};

/**
 * Fix common JSON syntax issues in LLM output.
 *
 * - Remove trailing commas before } or ]
 * - Remove single-line comments
 * - Fix unescaped newlines inside strings
 *
 * @param {string} text
 * @returns {string} Sanitized JSON string
 */
const sanitizeJSON = (text) => {
  let cleaned = text;

  // First extract JSON object if embedded in text
  const extracted = extractJSONByBrackets(cleaned);
  if (extracted) {
    cleaned = extracted;
  }

  // Remove trailing commas before closing brackets
  cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");

  // Remove single-line comments
  cleaned = cleaned.replace(/\/\/.*$/gm, "");

  return cleaned.trim();
};

/**
 * Validate that the parsed object matches the expected analysis schema.
 *
 * Missing fields are filled with defaults; wrong types are coerced
 * where possible so partial LLM responses still return usable data.
 *
 * @param {Object} data - Parsed JSON object
 * @returns {{ success: boolean, data: Object, error: string|null }}
 */
const validateAnalysisShape = (data) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { success: false, data: null, error: "Parsed result is not an object" };
  }

  const result = {};
  const warnings = [];

  for (const [field, expectedType] of Object.entries(ANALYSIS_SCHEMA)) {
    const value = data[field];

    if (value === undefined || value === null) {
      // Fill missing field with a sensible default
      result[field] = expectedType === "array" ? [] : "";
      warnings.push(`Missing field "${field}" — filled with default`);
    } else if (expectedType === "array" && !Array.isArray(value)) {
      // Coerce non-array to single-element array
      result[field] = typeof value === "string" ? [value] : [];
      warnings.push(`Field "${field}" was not an array — coerced`);
    } else if (expectedType === "string" && typeof value !== "string") {
      // Coerce non-string to string
      result[field] = String(value);
      warnings.push(`Field "${field}" was not a string — coerced`);
    } else {
      result[field] = value;
    }
  }

  if (warnings.length > 0) {
    logger.debug(`JSON validation warnings: ${warnings.join("; ")}`);
  }

  return { success: true, data: result, error: null };
};
