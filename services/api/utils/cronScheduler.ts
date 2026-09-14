import cron from 'node-cron';
import { generateAndSendNewsletter } from './newsletterGeneratorSimple.js';

let morningTask = null;
let eveningTask = null;
const nightTask = null;

/**
 * Initialize newsletter cron jobs
 * - 8 AM IST every day
 * - 5 PM IST every day
 */
const initializeNewsletterCron = () => {
	try {
		console.log('[Cron Scheduler] Initializing newsletter cron jobs...');
		console.log('[Cron Scheduler] Using UTC timezone (Render server time)');
		console.log('[Cron Scheduler] IST is UTC+5:30, so times are adjusted accordingly');

		// Cron expression: minute hour day month day-of-week (in UTC)
		// 8:00 AM IST = 2:30 AM UTC = 30 2 * * *
		// 5:00 PM IST = 11:30 AM UTC = 30 11 * * *

		// Morning newsletter at 8:00 AM IST (2:30 AM UTC)
		morningTask = cron.schedule('30 2 * * *', async () => {
			console.log('[Cron Scheduler] Executing morning newsletter task at 8:00 AM IST (2:30 AM UTC)');
			await generateAndSendNewsletter();
		});

		// Evening newsletter at 5:00 PM IST (11:30 AM UTC)
		eveningTask = cron.schedule('30 11 * * *', async () => {
			console.log('[Cron Scheduler] Executing evening newsletter task at 5:00 PM IST (11:30 AM UTC)');
			await generateAndSendNewsletter();
		});

		console.log('[Cron Scheduler] Newsletter cron jobs initialized successfully');
		console.log('[Cron Scheduler] Morning task: Every day at 8:00 AM IST');
		console.log('[Cron Scheduler] Evening task: Every day at 5:00 PM IST');

		return {
			morningTask,
			eveningTask
		};
	} catch (error) {
		console.error('[Cron Scheduler] Failed to initialize newsletter cron:', error);
		throw error;
	}
};

/**
 * Stop all cron jobs
 * Useful for graceful shutdown
 */
const stopNewsletterCron = () => {
	try {
		if (morningTask) {
			morningTask.stop();
			console.log('[Cron Scheduler] Stopped morning newsletter task');
		}
		if (eveningTask) {
			eveningTask.stop();
			console.log('[Cron Scheduler] Stopped evening newsletter task');
		}
	} catch (error) {
		console.error('[Cron Scheduler] Error stopping cron jobs:', error);
	}
};

/**
 * Get status of cron jobs
 */
const getNewsletterCronStatus = () => {
	return {
		morningTaskRunning: morningTask ? !morningTask.stopped : false,
		eveningTaskRunning: eveningTask ? !eveningTask.stopped : false,
		nightTaskRunning: nightTask ? !nightTask.stopped : false,
		morningSchedule: '8:00 AM IST (2:30 AM UTC)',
		eveningSchedule: '5:00 PM IST (11:30 AM UTC)',
		nightSchedule: '12:10 AM IST (6:40 PM UTC)'
	};
};

export {
	initializeNewsletterCron,
	stopNewsletterCron,
	getNewsletterCronStatus
};
