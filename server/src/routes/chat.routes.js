/**
 * Chat Routes
 *
 * POST /api/v1/chat/message          — Send message via legacy endpoint
 * GET  /api/v1/chat/history/:sessionId — Get chat history
 * POST /api/v1/chat/session           — Create new chat session
 * DELETE /api/v1/chat/session/:sessionId — Delete chat session
 */

import { Router } from "express";
import {
  sendMessage,
  getChatHistory,
  createSession,
  deleteSession,
  getSessions
} from "../controllers/chat.controller.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const router = Router();

router.post("/message", validateRequest, sendMessage);
router.get("/history/:sessionId", getChatHistory);
router.get("/sessions", getSessions);
router.post("/session", createSession);
router.delete("/session/:sessionId", deleteSession);

export default router;
