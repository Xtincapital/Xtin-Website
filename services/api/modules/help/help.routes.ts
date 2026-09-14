import express from "express";
import { submitContactForm } from "./help.controller.js";

const router = express.Router();

/* 🆘 HELP CENTER ROUTES */

// Public route for contact form submission
router.post("/help/contact", submitContactForm);

export default router;