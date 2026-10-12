/**
 * Paid-lesson YouTube IDs for the premium video modules.
 *
 * These live on the SERVER on purpose: the API only hands an ID to a signed-in
 * Academy Pro user (GET /api/learn/videos/:slug/:lesson), so they never ship in
 * the public JavaScript bundle. Lesson 1 of every module is free and public —
 * it lives in the web app (apps/web/src/features/academy/data/premiumCourseVideos.ts).
 *
 * To publish a lesson: put its YouTube ID (the part after `v=` or `youtu.be/`)
 * against the lesson NUMBER below and redeploy the API. Use *Unlisted* videos on
 * YouTube — a Pro viewer can still copy an ID, but strangers can't search for it.
 * Lessons left out (or null) show as "Coming soon".
 */
export const PREMIUM_VIDEO_IDS: Record<string, Record<number, string | null>> = {
    "personal-finance": {
        // 2: "xxxxxxxxxxx",
    },
    "stock-market-investing": {
        // 2: "xxxxxxxxxxx",
    },
    "mutual-funds": {
        // 2: "xxxxxxxxxxx",
    },
    "options-derivatives": {
        2: "6MvJbLV4Yzc",
        3: "xg4VYNH_8jQ",
        4: "CUg7h5Ert3Y",
        5: "TL7BtLIROxc",
        6: "pgzknuHVmdU",
        7: "5ZWmxp9fFDE",
    },
    "tax-planning": {
        // 2: "xxxxxxxxxxx",
    },
};
