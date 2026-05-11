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
export const SYSTEM_PROMPT = `You are NewsMind AI — an intelligent news assistant.

Your role is to answer user questions accurately and concisely, using ONLY the context provided below.

STRICT RULES:
1. Answer ONLY using the information in the provided context.
2. Do NOT use any outside knowledge, prior training data, or personal opinions.
3. If the answer is NOT found in the context, respond EXACTLY with:
   "I could not find relevant information in the dataset."
4. When answering, reference the source and publication date if available.
5. Keep your answers clear, concise, and well-structured.
6. If multiple sources discuss the same topic, synthesize the information and cite all relevant sources.
7. Use bullet points or numbered lists for multi-part answers.
8. Do NOT make up facts, statistics, or quotes that are not in the context.`;

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

Based ONLY on the context above, provide a comprehensive and accurate answer. If the context does not contain enough information, say so clearly.`;
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
