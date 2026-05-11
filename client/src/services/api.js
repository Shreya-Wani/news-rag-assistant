import axios from "axios";

/**
 * Axios instance with base configuration
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // TODO: Add auth token if needed
    // const token = localStorage.getItem("token");
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
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
    const message =
      error.response?.data?.message || error.message || "Something went wrong";

    // TODO: Handle specific error codes (401, 403, etc.)
    console.error("[API Error]:", message);

    return Promise.reject({ message, status: error.response?.status });
  }
);

export default api;
