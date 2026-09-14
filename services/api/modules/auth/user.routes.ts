import express from "express";
import { authenticate } from "../../middlewares/auth.js";
import {
	login,
	signup,
	logout,
	syncUser,
	getUserProfile,
	updateUserProfile
} from "./user.controller.js";
import { debugToken, verifyTokenDebug, checkAuthConfig } from "../../utils/authDebug.js";

const router = express.Router();

/* 🚀 AUTHENTICATION ROUTES */
router.post("/auth/login", login);
router.post("/auth/signup", signup);
router.post("/auth/logout", authenticate, logout);
router.post("/auth/sync", syncUser);
router.get("/auth/profile", authenticate, getUserProfile);
router.put("/auth/profile", authenticate, updateUserProfile);

/* 🔧 DEBUG ROUTES — decode/verify a token and report env config.
   Not authenticated, and debugToken() returns full JWT payload contents
   (email, name, phone), so these are disabled outside development. */
const devOnly = (req, res, next) => {
	if (process.env.NODE_ENV === "production") {
		return res.status(404).json({ error: "Not found" });
	}
	next();
};

router.get("/auth/debug-token", devOnly, (req, res) => {
	const token = req.headers.authorization?.split(" ")[1];

	if (!token) {
		return res.json({
			error: "No token provided",
			message: "Include token in Authorization header as 'Bearer <token>'"
		});
	}

	const debugInfo = debugToken(token);
	const verifyInfo = verifyTokenDebug(token);

	res.json({
		tokenDebug: debugInfo,
		verification: verifyInfo,
		authConfig: checkAuthConfig()
	});
});

router.get("/auth/debug-config", devOnly, (req, res) => {
	res.json(checkAuthConfig());
});

export default router;
