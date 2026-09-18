// Route mounting for the Gini AI chat endpoint (see chat.controller.ts
// header for the full port + real-gating explanation). NOT wired into
// app.ts/index.ts here — a later step mounts this router alongside the rest
// of modules/gini.
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { chatWithGini } from "./chat.controller.js";

const router = Router();

router.post("/gini/chat", authenticate, chatWithGini);

export default router;
