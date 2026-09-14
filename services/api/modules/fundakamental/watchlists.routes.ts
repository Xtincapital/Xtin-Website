import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import {
    createWatchlist,
    getWatchlists,
    getWatchlist,
    updateWatchlist,
    deleteWatchlist,
    addItemToWatchlist,
    getWatchlistItems,
    getWatchlistItem,
    updateWatchlistItem,
    removeItemFromWatchlist,
    addItemsBulk,
    removeItemsBulk,
    getWatchlistSummary,
    createWatchlistSnapshot,
    getWatchlistSnapshots,
} from "./watchlists.controller.js";

const router = Router();

// All watchlist routes require authentication.
router.post("/fundakamental/watchlists", authenticate, createWatchlist);
router.get("/fundakamental/watchlists", authenticate, getWatchlists);
router.get("/fundakamental/watchlists/:watchlistId", authenticate, getWatchlist);
router.patch("/fundakamental/watchlists/:watchlistId", authenticate, updateWatchlist);
router.delete("/fundakamental/watchlists/:watchlistId", authenticate, deleteWatchlist);

router.post("/fundakamental/watchlists/:watchlistId/items", authenticate, addItemToWatchlist);
router.get("/fundakamental/watchlists/:watchlistId/items", authenticate, getWatchlistItems);
router.post("/fundakamental/watchlists/:watchlistId/items/bulk", authenticate, addItemsBulk);
router.delete("/fundakamental/watchlists/:watchlistId/items", authenticate, removeItemsBulk);
router.get("/fundakamental/watchlists/:watchlistId/items/:itemId", authenticate, getWatchlistItem);
router.patch("/fundakamental/watchlists/:watchlistId/items/:itemId", authenticate, updateWatchlistItem);
router.delete("/fundakamental/watchlists/:watchlistId/items/:itemId", authenticate, removeItemFromWatchlist);

router.get("/fundakamental/watchlists/:watchlistId/summary", authenticate, getWatchlistSummary);
router.post("/fundakamental/watchlists/:watchlistId/snapshot", authenticate, createWatchlistSnapshot);
router.get("/fundakamental/watchlists/:watchlistId/snapshots", authenticate, getWatchlistSnapshots);

export default router;
