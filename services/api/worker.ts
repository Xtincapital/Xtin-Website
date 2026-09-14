// ============================================================
// STANDALONE NEWSLETTER WORKER — no Express server, no HTTP listener.
//
// For a dedicated Render Background Worker service, separate from the web
// process (Phase 3's "move cron out of the web process" item). Runs only
// the twice-daily in-process schedule; the dedupe lock in
// newsletter_runs (see newsletterRunner.ts) is what makes it safe to run
// this alongside the web service's own scheduler and its external
// cron-job.org HTTP trigger — whichever fires first for a given window
// wins, the others see the lock and skip.
//
// Deploy as a Render "Background Worker" (not "Web Service") with:
//   Start Command: npx tsx worker.ts
// pointed at the same repo/root directory and the same env vars as the
// web service. Once it's live and confirmed working, DISABLE_NEWSLETTER_CRON=true
// can be set on the web service to stop it from also scheduling (the
// worker becomes the single source; the web service keeps the external
// HTTP trigger endpoint as a backup path regardless).
// ============================================================

import { startNewsletterScheduler } from "./modules/newsletter/scheduler.js";

console.log("[Worker] Newsletter worker starting (no HTTP server)...");
startNewsletterScheduler();
console.log("[Worker] Scheduler registered. Process will stay alive on the cron timers.");

// Keep the process alive — node-cron's timers alone don't do this on their
// own once nothing else is scheduled to run, so hold the event loop open
// explicitly rather than relying on incidental listeners.
setInterval(() => {}, 1 << 30);
