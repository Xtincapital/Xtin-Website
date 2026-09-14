import express from "express";
import {
	getSubstackArticles,
	getSubstackArticleBySlug,
} from "./substack.controller.js";

const router = express.Router();

// Get all Substack articles (archive)
router.get("/substack/articles", getSubstackArticles);

// Get a single Substack article (full body) by slug
router.get("/substack/articles/:slug", getSubstackArticleBySlug);

export default router;
