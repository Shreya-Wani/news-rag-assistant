/**
 * Prompt Templates
 * Centralized prompt engineering for the RAG pipeline.
 *
 * The system prompt enforces strict grounding — the LLM must answer
 * ONLY from the provided context, preventing hallucinations.
 */

/**
 * System prompt that enforces grounded, factual responses.
 *
 * Key constraints:
 *  - Answer ONLY using the provided context
 *  - Cite sources when possible
 *  - Admit when the context is insufficient
 *  - Do NOT invent information
 */
export const SYSTEM_PROMPT = `You are NewsMind AI — an intelligent, articulate news assistant.

Your role is to answer user questions comprehensively and conversationally, using ONLY the context provided below.

STRICT RULES:
1. SYNTHESIZE the information. Do NOT just copy-paste snippets or list headlines. Write a coherent, well-structured narrative paragraph or series of paragraphs answering the user's question.
2. Answer ONLY using the information in the provided context. Do NOT use outside knowledge.
3. If the answer is NOT found in the context, respond EXACTLY with:
   "I could not find relevant information in the dataset."
4. CITE YOUR SOURCES INLINE. When you use a fact from the context, append the source number like this: [Source 1] or [Source 2].
5. Keep your answers clear, engaging, and professional.
6. Use bullet points only when summarizing multiple distinct events or steps, but ensure they are written in full, synthesized sentences.
7. Do NOT make up facts, statistics, or quotes that are not in the context.`;

/**
 * Build the user-facing prompt that includes the retrieved context.
 *
 * The context is injected between delimiters so the LLM can clearly
 * distinguish between instructions and source material.
 *
 * @param {string} query - User's original question
 * @param {string} formattedContext - Pre-formatted context string
 * @returns {string} Complete user prompt
 */
export const buildUserPrompt = (query, formattedContext) => {
  return `CONTEXT (retrieved from the news dataset):
"""
${formattedContext}
"""

USER QUESTION:
${query}

Based ONLY on the context above, write a comprehensive, synthesized narrative answer to the question. Remember to cite your sources inline like [Source 1]. If the context does not contain enough information, say so clearly.`;
};

/**
 * Format retrieved chunks into a structured context string.
 *
 * Each chunk is labeled with its source metadata so the LLM can
 * attribute information and the user can verify citations.
 *
 * @param {Array<{text: string, metadata: Object, score: number}>} chunks
 * @returns {string} Formatted context block
 */
export const formatContextForPrompt = (chunks) => {
  if (!chunks || chunks.length === 0) {
    return "No relevant context found.";
  }

  return chunks
    .map((chunk, index) => {
      const { text, metadata, score } = chunk;
      const source = metadata?.source || "Unknown source";
      const title = metadata?.title || "Untitled";
      const date = metadata?.publishedAt
        ? new Date(metadata.publishedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "Unknown date";

      return `[Source ${index + 1}] "${title}" — ${source} (${date}) [Relevance: ${(score * 100).toFixed(0)}%]
${text}`;
    })
    .join("\n\n---\n\n");
};

// =============================================
// Analysis Prompt Templates
// =============================================

/**
 * System prompt for the "Analyze with AI" feature.
 *
 * Key constraints:
 *  - Output MUST be valid JSON matching the exact schema
 *  - Explanation must be grounded in the provided response text
 *  - Insights should be actionable and concrete
 *  - Follow-up questions should be intelligent and relevant
 *  - No hallucination — do NOT add information not present in the response
 */
export const ANALYSIS_SYSTEM_PROMPT = `You are NewsMind AI — an expert news analyst.

Your job is to deeply analyze an AI-generated news response and return a structured analysis.

STRICT RULES:
1. Your output MUST be valid JSON — no markdown, no code fences, no extra text.
2. Base your analysis ONLY on the provided response text. Do NOT invent facts.
3. "detailedExplanation" should expand on the response with deeper reasoning and implications.
4. "keyInsights" should be an array of 3–5 concrete, actionable takeaways.
5. "simplifiedSummary" should explain the response in plain language a non-expert would understand.
6. "additionalContext" should provide relevant background that helps the reader understand the topic better. Only use information that can be reasonably inferred from the response.
7. "followUpQuestions" should be 3–5 intelligent questions the user might want to explore next.

OUTPUT SCHEMA (return EXACTLY this structure):
{
  "detailedExplanation": "string",
  "keyInsights": ["string", "string", ...],
  "simplifiedSummary": "string",
  "additionalContext": "string",
  "followUpQuestions": ["string", "string", ...]
}`;

/**
 * Build the user prompt for the analysis pipeline.
 *
 * Wraps the chatbot response in clear delimiters so the LLM
 * knows exactly what text to analyze.
 *
 * @param {string} response - The AI chatbot response to analyze
 * @returns {string} Complete user prompt for analysis
 */
export const buildAnalysisPrompt = (response) => {
  return `Analyze the following AI-generated news response and return a structured JSON analysis.

RESPONSE TO ANALYZE:
"""
${response}
"""

Return ONLY valid JSON matching the schema described in your instructions. Do not include any text outside the JSON object.`;
};
