import { Router } from "express";
import {
  sendMessage,
  getChatHistory,
  createSession,
  deleteSession,
} from "../controllers/chat.controller.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const router = Router();

router.post("/message", validateRequest, sendMessage);
router.get("/history/:sessionId", getChatHistory);
router.post("/session", createSession);
router.delete("/session/:sessionId", deleteSession);

export default router;
