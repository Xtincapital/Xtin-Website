import { Router } from "express";
import { getFxRates } from "./fx.service.js";

const router = Router();

// Public: the exchange rates the website uses to show prices in other currencies.
router.get("/fx/rates", async (_req, res) => {
	const snapshot = await getFxRates();
	// Rates only move daily, so let the browser and CDN reuse the answer for an hour.
	res.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
	res.json({ status: "success", data: snapshot });
});

export default router;
