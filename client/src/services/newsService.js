import api from "./api.js";

/**
 * News API Service
 */
const newsService = {
  /**
   * Get paginated news articles
   * @param {Object} params - { page, limit, category }
   * @returns {Promise} Articles list
   */
  getArticles: (params = {}) => {
    return api.get("/news", { params });
  },

  /**
   * Get a single article by ID
   * @param {string} id - Article ID
   * @returns {Promise} Article data
   */
  getArticleById: (id) => {
    return api.get(`/news/${id}`);
  },

  /**
   * Search articles
   * @param {string} query - Search query
   * @returns {Promise} Search results
   */
  searchArticles: (query) => {
    return api.get("/news/search", { params: { q: query } });
  },
};

export default newsService;
