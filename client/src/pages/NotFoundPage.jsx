import axios from "axios";

/**
 * Axios instance with base configuration
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
  timeout: 120000, // 2 minutes — RAG pipeline (HuggingFace + Pinecone + Gemini) can be slow
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Timeout error
    if (error.code === "ECONNABORTED") {
      const msg = "Request timed out — the AI pipeline is taking too long. Please try again.";
      console.error("[API Timeout]:", msg);
      return Promise.reject({ message: msg, status: 408 });
    }

    // Network error (server down)
    if (!error.response) {
      const msg = "Cannot reach the server. Make sure the backend is running on port 5000.";
      console.error("[API Network Error]:", msg);
      return Promise.reject({ message: msg, status: 503 });
    }

    const message =
      error.response?.data?.message || error.message || "Something went wrong";

    console.error("[API Error]:", message);
    return Promise.reject({ message, status: error.response?.status });
  }
);

export default api;
