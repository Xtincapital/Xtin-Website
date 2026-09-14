// Document chat routes — Node/TS port of `api/endpoints/chat.py`'s router.
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { sendChatMessage, getChatHistory } from "./chat.controller.js";

const router = Router();

router.post("/fundakamental/chat/message", authenticate, sendChatMessage);
router.get("/fundakamental/chat/history/:reportId", authenticate, getChatHistory);

export default router;
