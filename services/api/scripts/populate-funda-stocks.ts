// Fills funda_stocks (the Stock Scanner's universe) with full fundamentals for
// the curated India + US lists in modules/fundakamental/stockPipeline.ts.
//
// Run it from a machine Yahoo doesn't block (Render's IP gets 429s, so the
// server can't do this itself). Safe to re-run: rows are upserted by ticker.
// The daily price job (stockPriceRefresh.ts) keeps prices current afterwards;
// re-run this every few weeks so P/E, margins, growth etc. stay fresh.
//
//   npx tsx scripts/populate-funda-stocks.ts            # India + US
//   npx tsx scripts/populate-funda-stocks.ts india      # one market

import "dotenv/config";

const arg = process.argv[2];
const markets = arg === "india" || arg === "us" ? [arg] : ["india", "us"];

const { refresh } = await import("../modules/fundakamental/stockPipeline.js");
const result = await refresh(markets as Array<"india" | "us">);
console.log("Done:", JSON.stringify(result));
process.exit(0);
