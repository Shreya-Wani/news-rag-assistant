import { useState, useCallback } from "react";
import toast from "react-hot-toast";

/**
 * Custom hook for handling API calls with loading and error states
 * @param {Function} apiFunction - The API service function to call
 * @returns {Object} { data, loading, error, execute }
 */
const useApi = (apiFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiFunction(...args);
        setData(response.data);
        return response;
      } catch (err) {
        const errorMessage = err.message || "Something went wrong";
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  return { data, loading, error, execute };
};

export default useApi;
