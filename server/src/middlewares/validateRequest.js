import { ApiError } from "../utils/ApiError.js";

/**
 * Basic request body validation middleware
 * Ensures required fields are present in the request body
 */
export const validateRequest = (req, _res, next) => {
  // TODO: Add specific validation logic per route
  if (req.method === "POST" && (!req.body || Object.keys(req.body).length === 0)) {
    throw new ApiError(400, "Request body cannot be empty");
  }
  next();
};

/**
 * Validate MongoDB ObjectId parameter
 */
export const validateObjectId = (req, _res, next) => {
  const { id } = req.params;
  if (id && !/^[0-9a-fA-F]{24}$/.test(id)) {
    throw new ApiError(400, "Invalid ID format");
  }
  next();
};
