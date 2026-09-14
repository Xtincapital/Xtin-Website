// ============================================================
// NEWSLETTER RUNNER — single source of truth for generating + sending.
//
// Both the in-process scheduler (modules/newsletter/scheduler.ts) and the external
// cron HTTP trigger (modules/newsletter/newsletter.controller.ts) call runNewsletterJob().
// The lock + 15-minute rate limit are backed by the newsletter_runs table
// (not in-memory) so they hold even across separate processes — e.g. once
// the cron moves out of the web process into its own Render worker, the
// web service and the worker are two different processes with two
// different memory spaces, and only a shared, persisted lock can prevent
// both from sending the same newsletter.
//
// Known tradeoff vs. the old in-memory version: checking the latest run
// and inserting a new "running" row are two separate round trips, not one
// atomic operation, so a true dead-heat (two triggers within milliseconds
// of each other) could theoretically both pass the check. Given the real
// trigger sources are a twice-daily cron plus occasional manual/external
// triggers — not concurrent traffic — this residual window is an accepted
// tradeoff, not something worth a distributed-lock mechanism for.
// ============================================================

import { getLatestRun, startRun, completeRun, getRecentRuns } from "./newsletterRun.repository.js";

// Minimum time between newsletter executions (15 minutes).
const MIN_EXECUTION_INTERVAL_MS = 15 * 60 * 1000;

// A run stuck in "running" longer than this is treated as crashed rather
// than actually in progress. The old in-memory store self-healed on any
// process restart (crash = fresh memory = lock gone); a DB-persisted lock
// needs an explicit escape hatch or a genuine crash mid-send would wedge
// every future run until someone manually fixes the row.
const STALE_RUNNING_MS = 30 * 60 * 1000;

async function shouldAllowExecution() {
	const { data: latest, error } = await getLatestRun();

	if (error) {
		console.error('[NewsletterRunner] Failed to read latest run, allowing execution:', error.message);
		return { allowed: true };
	}
	if (!latest) {
		return { allowed: true };
	}

	const startedAt = new Date(latest.started_at).getTime();
	const now = Date.now();

	if (latest.status === 'running') {
		if (now - startedAt < STALE_RUNNING_MS) {
			return {
				allowed: false,
				reason: 'Newsletter generation already in progress',
				retryAfter: 300,
			};
		}
		console.warn(
			`[NewsletterRunner] Last run (${latest.id}) has been "running" for over ${STALE_RUNNING_MS / 60000} minutes — treating as crashed, allowing a new run.`
		);
		return { allowed: true };
	}

	const elapsed = now - startedAt;
	if (elapsed < MIN_EXECUTION_INTERVAL_MS) {
		const retryAfter = Math.ceil((MIN_EXECUTION_INTERVAL_MS - elapsed) / 1000);
		return {
			allowed: false,
			reason: `Newsletter already sent ${Math.floor(elapsed / 60000)} minutes ago. Minimum interval is 15 minutes.`,
			retryAfter,
			lastResult: latest.result,
		};
	}

	return { allowed: true };
}

/**
 * Generate + send the newsletter, guarded by the shared lock/rate-limit.
 * @param {{ source?: string }} opts - where the trigger came from (for logs/history)
 * @returns {Promise<{skipped?: boolean, success?: boolean, ...}>}
 */
export async function runNewsletterJob({ source = 'unknown' } = {}) {
	const check = await shouldAllowExecution();
	if (!check.allowed) {
		console.log(`[NewsletterRunner] (${source}) skipped: ${check.reason}`);
		return {
			skipped: true,
			reason: check.reason,
			retryAfter: check.retryAfter,
			lastResult: check.lastResult,
			timestamp: new Date().toISOString(),
		};
	}

	const { data: run, error: startError } = await startRun(source);
	if (startError || !run) {
		// Don't block newsletter delivery over a logging failure — proceed
		// without a row to complete later (dedupe for this one run is lost,
		// but sending still happens, matching the "never fail the response
		// over storage" philosophy used elsewhere in this codebase).
		console.error('[NewsletterRunner] Failed to record run start:', startError?.message);
	}

	console.log(`[NewsletterRunner] (${source}) starting generation + send...`);
	console.log('[NewsletterRunner] UTC:', new Date().toISOString());
	console.log('[NewsletterRunner] IST:', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));

	try {
		// Imported lazily so a load error in the generator can't crash boot.
		const { generateAndSendNewsletter } = await import('../../utils/newsletterGeneratorSimple.js');
		const result = await generateAndSendNewsletter();
		if (run) await completeRun(run.id, result?.success ? 'success' : 'failed', result);
		console.log(`[NewsletterRunner] (${source}) completed:`, result?.success ? 'success' : 'failed');
		return result;
	} catch (error) {
		const result = { success: false, error: error.message };
		if (run) await completeRun(run.id, 'failed', result);
		console.error(`[NewsletterRunner] (${source}) failed:`, error.message);
		return result;
	}
}

// Snapshot of execution state for the /api/cron-status endpoint.
export async function getExecutionState() {
	const { data: latest } = await getLatestRun();
	const { data: history } = await getRecentRuns(10);

	return {
		minIntervalMinutes: 15,
		currentlyRunning: latest?.status === 'running',
		lastExecution: latest?.started_at ? new Date(latest.started_at).toISOString() : null,
		executionHistory: (history || []).map((h) => ({ timestamp: h.started_at, result: h.result })),
	};
}
