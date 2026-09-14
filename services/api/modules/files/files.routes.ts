import { Router } from "express";
import { getPublicUrl } from "../../utils/supabaseStorage.js";

const router = Router();

// This route is now deprecated since we use direct Supabase Storage URLs
// Keeping it for backward compatibility or if you need to proxy files
router.get("/files/:filePath", async (req, res) => {
	try {
		const filePath = req.params.filePath;
		const url = getPublicUrl(filePath);

		// Redirect to the Supabase Storage URL
		res.redirect(url);
	} catch (e) {
		console.error(e);
		return res.status(500).send("Server error");
	}
});

export default router;


