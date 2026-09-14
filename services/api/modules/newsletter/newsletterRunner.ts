// ============================================================
// NEWSLETTER RUNNER — single source of truth for generating + sending.
//
// Both the in-process scheduler (modules/newsletter/scheduler.mjs) and the external
// cron HTTP trigger (controllers/newsletter.controller.mjs) call runNewsletterJob().
// A shared in-memory lock + 15-minute rate limit guarantees the newsletter is
// generated/sent at most once per slot even if both fire at the same time.
// ============================================================

// Minimum time between newsletter executions (15 minutes).
const MIN_EXECUTION_INTERVAL_MS = 15 * 60 * 1000;

// In-memory execution store (resets on server restart).
const cronExecutionStore = {
	lastExecutionTime: null,
	lastExecutionResult: null,
	isCurrentlyRunning: false,
	executionHistory: [], // Keep last 10 executions
};

// Decide whether a new execution is allowed right now.
function shouldAllowExecution() {
	const now = Date.now();

	if (cronExecutionStore.isCurrentlyRunning) {
		return {
			allowed: false,
			reason: 'Newsletter generation already in progress',
			retryAfter: 300,
		};
	}

	if (cronExecutionStore.lastExecutionTime) {
		const elapsed = now - cronExecutionStore.lastExecutionTime;
		if (elapsed < MIN_EXECUTION_INTERVAL_MS) {
			const retryAfter = Math.ceil((MIN_EXECUTION_INTERVAL_MS - elapsed) / 1000);
			return {
				allowed: false,
				reason: `Newsletter already sent ${Math.floor(elapsed / 60000)} minutes ago. Minimum interval is 15 minutes.`,
				retryAfter,
				lastResult: cronExecutionStore.lastExecutionResult,
			};
		}
	}

	return { allowed: true };
}

function recordStart() {
	cronExecutionStore.isCurrentlyRunning = true;
}

function recordCompletion(result) {
	cronExecutionStore.isCurrentlyRunning = false;
	cronExecutionStore.lastExecutionTime = Date.now();
	cronExecutionStore.lastExecutionResult = result;

	cronExecutionStore.executionHistory.unshift({
		timestamp: new Date().toISOString(),
		result,
	});
	if (cronExecutionStore.executionHistory.length > 10) {
		cronExecutionStore.executionHistory.pop();
	}
}

/**
 * Generate + send the newsletter, guarded by the shared lock/rate-limit.
 * @param {{ source?: string }} opts - where the trigger came from (for logs/history)
 * @returns {Promise<{skipped?: boolean, success?: boolean, ...}>}
 */
export async function runNewsletterJob({ source = 'unknown' } = {}) {
	const check = shouldAllowExecution();
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

	recordStart();
	console.log(`[NewsletterRunner] (${source}) starting generation + send...`);
	console.log('[NewsletterRunner] UTC:', new Date().toISOString());
	console.log('[NewsletterRunner] IST:', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));

	try {
		// Imported lazily so a load error in the generator can't crash boot.
		const { generateAndSendNewsletter } = await import('../../utils/newsletterGeneratorSimple.js');
		const result = await generateAndSendNewsletter();
		recordCompletion(result);
		console.log(`[NewsletterRunner] (${source}) completed:`, result?.success ? 'success' : 'failed');
		return result;
	} catch (error) {
		const result = { success: false, error: error.message };
		recordCompletion(result);
		console.error(`[NewsletterRunner] (${source}) failed:`, error.message);
		return result;
	}
}

// Snapshot of execution state for the /api/cron-status endpoint.
export function getExecutionState() {
	return {
		minIntervalMinutes: 15,
		currentlyRunning: cronExecutionStore.isCurrentlyRunning,
		lastExecution: cronExecutionStore.lastExecutionTime
			? new Date(cronExecutionStore.lastExecutionTime).toISOString()
			: null,
		executionHistory: cronExecutionStore.executionHistory,
	};
}
