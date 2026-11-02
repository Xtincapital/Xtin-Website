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
        2: "tUxiimXBHw8",
        3: "PunLJaVlErs",
        4: "Lux0q2CW5SE",
        5: "XcvQ4Yc77rE",
        6: "l77o-JwK2AQ",
        7: "301Z_IKKYPY",
        8: "XKOV-SWRfeo",
        9: "bEefwfDs0Mk",
        10: "PyaYXKvnU-M",
        11: "NXPfxXitGUk",
        12: "VueRET9vioA",
    },
    "stock-market-investing": {
        2: "4Wc2mTJ3ksY",
        3: "a8RmsaI2Ob8",
        4: "t0-Y-KkFXhc",
        5: "pY6RmMS8N6M",
        6: "A7d9MmqP-vo",
        7: "NYJ6jIGrpq4",
        8: "rXG1dyolPbg",
        9: "4pT6sBjjOcY",
        10: "StQqg-BRBZU",
        11: "FbIuNVRSSaQ",
        12: "KejxO1BvdJs",
        13: "6tKR0qskMHY",
        14: "SbzQjxC41e0",
        15: "qD-_Z42YUVo",
    },
    "mutual-funds": {
        2: "BTiv_yc-Okk",
        3: "6aGJvm9AYdQ",
        4: "RntIriS_vuw",
        5: "QRiMXQJqO8U",
        6: "FRSBGYvWZOY",
        7: "fIioCuwsMfw",
        8: "wh62LvHlYPI",
        9: "K0Dj4e9NvZ8",
        10: "BUTC8VWeAzo",
    },
    "options-derivatives": {
        2: "6MvJbLV4Yzc",
        3: "xg4VYNH_8jQ",
        4: "CUg7h5Ert3Y",
        5: "TL7BtLIROxc",
        6: "pgzknuHVmdU",
        7: "5ZWmxp9fFDE",
        8: "BHCGe8B3SDw",
        9: "67xSlwJXRrw",
        10: "IKYclgELQh0",
        11: "O2EKf7vuOns",
        12: "1eEuYrrQBGg",
        13: "OdukJbCDqhs",
        14: "woxvMD8IdfE",
    },
    "tax-planning": {
        2: "JiAZ3XFleYc",
        3: "1-317_Ir5rs",
        4: "j11dQP8hmhA",
        5: "njfMilSJfb0",
        6: "vQwkAfO6W1M",
        7: "3jFwKRVLhnU",
        8: "ZCtxvPkeloA",
    },
};
