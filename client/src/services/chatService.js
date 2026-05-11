import api from "./api.js";

/**
 * Chat API Service
 */
const chatService = {
  /**
   * Send a message to the AI chatbot
   * @param {Object} payload - { message, sessionId }
   * @returns {Promise} API response
   */
  sendMessage: (payload) => {
    return api.post("/chat/message", payload);
  },

  /**
   * Get chat history for a session
   * @param {string} sessionId
   * @returns {Promise} Chat history
   */
  getChatHistory: (sessionId) => {
    return api.get(`/chat/history/${sessionId}`);
  },

  /**
   * Create a new chat session
   * @returns {Promise} New session data
   */
  createSession: () => {
    return api.post("/chat/session");
  },

  /**
   * Delete a chat session
   * @param {string} sessionId
   * @returns {Promise} Deletion result
   */
  deleteSession: (sessionId) => {
    return api.delete(`/chat/session/${sessionId}`);
  },
};

export default chatService;
