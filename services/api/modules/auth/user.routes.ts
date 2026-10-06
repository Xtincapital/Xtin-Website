import express from "express";
import { authenticate } from "../../middlewares/auth.js";
import {
	login,
	signup,
	logout,
	syncUser,
	getUserProfile,
	updateUserProfile,
	deleteAccount
} from "./user.controller.js";

const router = express.Router();

/* 🚀 AUTHENTICATION ROUTES */
router.post("/auth/login", login);
router.post("/auth/signup", signup);
router.post("/auth/logout", authenticate, logout);
router.post("/auth/sync", syncUser);
router.get("/auth/profile", authenticate, getUserProfile);
router.put("/auth/profile", authenticate, updateUserProfile);
router.delete("/auth/account", authenticate, deleteAccount);

export default router;
