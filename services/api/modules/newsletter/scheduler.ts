import cron from 'node-cron';
import { runNewsletterJob } from './newsletterRunner.js';

// ============================================================
// IN-PROCESS NEWSLETTER SCHEDULER
//
// Fires the newsletter generation/send twice daily in India time, without
// depending on any external cron service. The shared runner (newsletterRunner)
// dedupes against the external HTTP trigger, so running both is safe.
//
// NOTE: On a sleeping host (e.g. Render free tier), the Node process is paused
// when idle and these timers won't fire. Keep an external keep-alive/trigger
// (cron-job.org hitting /health or /api/trigger-newsletter) for that case.
// On an always-on host (paid plan / VPS), this scheduler is fully self-sufficient.
// ============================================================

const TIMEZONE = 'Asia/Kolkata';

// 8:00 AM IST and 5:00 PM IST, every day.
const SCHEDULES = [
	{ label: 'morning (8:00 AM IST)', expr: '0 8 * * *' },
	{ label: 'evening (5:00 PM IST)', expr: '0 17 * * *' },
];

export function startNewsletterScheduler() {
	if (process.env.DISABLE_NEWSLETTER_CRON === 'true') {
		console.log('[Scheduler] In-process newsletter cron disabled via DISABLE_NEWSLETTER_CRON.');
		return;
	}

	for (const { label, expr } of SCHEDULES) {
		if (!cron.validate(expr)) {
			console.error(`[Scheduler] Invalid cron expression for ${label}: ${expr}`);
			continue;
		}
		cron.schedule(
			expr,
			() => {
				console.log(`[Scheduler] Triggering ${label} newsletter.`);
				runNewsletterJob({ source: `in-process-cron:${label}` }).catch((err) =>
					console.error('[Scheduler] Job error:', err.message)
				);
			},
			{ timezone: TIMEZONE }
		);
		console.log(`[Scheduler] Registered ${label} → "${expr}" (${TIMEZONE})`);
	}
}
