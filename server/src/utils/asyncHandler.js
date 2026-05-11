/**
 * Async handler wrapper to avoid try-catch boilerplate
 * @param {Function} fn - Async controller function
 * @returns {Function} Express middleware
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
