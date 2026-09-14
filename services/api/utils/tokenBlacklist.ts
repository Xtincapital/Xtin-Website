/**
 * Token Blacklist Utility
 * 
 * Provides a mechanism to invalidate JWTs before their natural expiry.
 * Persists to disk so the blacklist survives server restarts.
 * Uses an append-only JSON file for crash-safe persistence.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLACKLIST_FILE = path.join(__dirname, '..', 'data', 'token-blacklist.json');

// Ensure data directory exists
const DATA_DIR = path.dirname(BLACKLIST_FILE);
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Store blacklisted tokens: Map<tokenId, expiryTimestamp>
const blacklistedTokens = new Map();

// Track whether a disk save is pending (debounce)
let saveTimeout = null;

/**
 * Load the blacklist from disk on startup
 */
function loadFromDisk() {
    try {
        if (fs.existsSync(BLACKLIST_FILE)) {
            const raw = fs.readFileSync(BLACKLIST_FILE, 'utf-8');
            const data: Record<string, number> = JSON.parse(raw);
            const now = Date.now();
            let loaded = 0;
            let expired = 0;
            for (const [tokenId, expiry] of Object.entries(data)) {
                if (expiry > now) {
                    blacklistedTokens.set(tokenId, expiry);
                    loaded++;
                } else {
                    expired++;
                }
            }
            console.log(`[TokenBlacklist] Loaded ${loaded} active token(s) from disk (${expired} expired skipped)`);
        } else {
            console.log('[TokenBlacklist] No existing blacklist file found, starting fresh');
        }
    } catch (err) {
        console.error('[TokenBlacklist] Failed to load from disk:', err.message);
    }
}

/**
 * Persist the current blacklist to disk (debounced)
 */
function persistToDisk() {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        try {
            const obj = {};
            const now = Date.now();
            for (const [tokenId, expiry] of blacklistedTokens.entries()) {
                if (expiry > now) {
                    obj[tokenId] = expiry;
                }
            }
            fs.writeFileSync(BLACKLIST_FILE, JSON.stringify(obj, null, 2), 'utf-8');
        } catch (err) {
            console.error('[TokenBlacklist] Failed to persist to disk:', err.message);
        }
        saveTimeout = null;
    }, 500); // Debounce writes to avoid excessive I/O
}

// Load existing blacklist on startup
loadFromDisk();

// Run cleanup every 15 minutes (also triggers a disk persist)
const CLEANUP_INTERVAL = 15 * 60 * 1000;

setInterval(() => {
    const now = Date.now();
    let cleaned = 0;
    for (const [tokenId, expiry] of blacklistedTokens.entries()) {
        if (expiry < now) {
            blacklistedTokens.delete(tokenId);
            cleaned++;
        }
    }
    if (cleaned > 0) {
        console.log(`[TokenBlacklist] Cleaned ${cleaned} expired token(s)`);
        persistToDisk();
    }
}, CLEANUP_INTERVAL);

/**
 * Add a token to the blacklist
 * @param {string} tokenId - Unique identifier from the JWT (jti claim)
 * @param {number} expiresIn - Seconds until token naturally expires
 */
export const blacklistToken = (tokenId, expiresIn = 3600) => {
    if (!tokenId) return;
    const expiry = Date.now() + expiresIn * 1000;
    blacklistedTokens.set(tokenId, expiry);
    persistToDisk();
    console.log(`[TokenBlacklist] Token blacklisted, expires in ${expiresIn}s`);
};

/**
 * Check if a token is blacklisted
 * @param {string} tokenId - The JWT ID to check
 * @returns {boolean}
 */
export const isTokenBlacklisted = (tokenId) => {
    if (!tokenId) return false;
    const expiry = blacklistedTokens.get(tokenId);
    if (!expiry) return false;
    if (expiry < Date.now()) {
        blacklistedTokens.delete(tokenId);
        persistToDisk();
        return false;
    }
    return true;
};

/**
 * Get the size of the blacklist (for monitoring)
 * @returns {number}
 */
export const getBlacklistSize = () => blacklistedTokens.size;

