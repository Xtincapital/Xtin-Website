// Account dashboard money API.
//
// GET /dashboard/money — everything the dashboard's money sections show, in
//   one request: Gini's household, assets, loans and goals; the user's money
//   basics; monthly net-worth history; this month's Journal trades; Learn
//   progress; and AI token balances. Each part is read on its own, so one that
//   fails comes back null instead of failing the page. It also records this
//   month's net worth (one point per month, latest value wins) — the only
//   history Gini keeps.
// PUT /dashboard/money/profile — saves the money basics (partial updates).
//
// Auth: `req.user.authId` (auth.users.id) for Gini, Journal and wallets;
// `req.user.userId` for lesson progress, which predates Supabase-only auth.

import { HTTP_STATUS } from "../../constants/constants.js";
import { readAppState, readGini, readLearnProgress, readTokenBalance, readTradesSince, writeAppState } from "./dashboard.repository.js";
import { asHistory, asProfile, mergeProfile, todayInIndia, validateMoneyProfilePatch, withSnapshot } from "./moneyProfile.js";

async function settle<T>(label: string, read: () => Promise<T>): Promise<T | null> {
    try {
        return await read();
    } catch (err) {
        console.error(`[Dashboard] ${label} failed:`, (err as Error)?.message || err);
        return null;
    }
}

const total = (list: Record<string, unknown>[], field: string) => list.reduce((s, r) => s + (Number(r[field]) || 0), 0);

export const getMoneySummary = async (req, res) => {
    const authId = req.user.authId;
    const today = todayInIndia();
    const month = today.slice(0, 7);

    const [gini, appState, trades, learn, giniTokens, journalTokens] = await Promise.all([
        settle("gini", () => readGini(authId)),
        settle("app state", () => readAppState(authId)),
        settle("trades", () => readTradesSince(authId, `${month}-01`)),
        settle("learn", () => readLearnProgress(req.user.userId)),
        settle("gini tokens", () => readTokenBalance("gini_ai_wallets", authId)),
        settle("journal tokens", () => readTokenBalance("journal_ai_wallets", authId)),
    ]);

    let history = asHistory(appState?.netWorthHistory);
    // Only write when app_state was read (never overwrite what we couldn't see)
    // and there is something to record.
    if (gini && appState && (gini.assets.length > 0 || gini.liabilities.length > 0)) {
        const snap = withSnapshot(history, { month, assets: total(gini.assets, "value"), liabilities: total(gini.liabilities, "amount") });
        history = snap.history;
        if (snap.changed) await settle("net worth snapshot", () => writeAppState(authId, { ...appState, netWorthHistory: snap.history }));
    }

    return res.status(HTTP_STATUS.OK).json({
        gini,
        profile: appState ? asProfile(appState.money) : null,
        netWorthHistory: history,
        trades,
        learn,
        tokens: { gini: giniTokens, journal: journalTokens },
    });
};

export const updateMoneyProfile = async (req, res) => {
    const validation = validateMoneyProfilePatch(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    const authId = req.user.authId;
    try {
        const appState = await readAppState(authId);
        const profile = mergeProfile(asProfile(appState.money), validation.data);
        await writeAppState(authId, { ...appState, money: profile });
        return res.status(HTTP_STATUS.OK).json({ profile });
    } catch (err) {
        console.error("[Dashboard] save money profile failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Could not save your money details" });
    }
};
