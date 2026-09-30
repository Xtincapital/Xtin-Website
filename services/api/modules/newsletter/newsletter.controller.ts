import { spawn } from "child_process";
import nodemailer from 'nodemailer';
import { HTTP_STATUS } from "../../constants/constants.js";
import { getNewsletters, getNewsletterById, createNewsletter, getIndianFinanceNewsletters, getIndianFinanceNewsletterById, createIndianFinanceNewsletter } from "./newsletter.repository.js";
import { readSubscribers } from "./subscription.repository.js";
import { sendEmailToAll } from "../../services/mail.service.js";
import { runNewsletterJob, getExecutionState, startNewsletterJobInBackground } from "./newsletterRunner.js";

// Rate limiting, deduplication, and the generate+send logic now live in
// modules/newsletter/newsletterRunner.mjs so the in-process scheduler and this HTTP
// trigger share one lock. See runNewsletterJob / getExecutionState.

const getAllNewsletters = async (req, res) => {
	try {
		const newsletters = await getNewsletters();
		return res.status(HTTP_STATUS.OK).json({
			status: HTTP_STATUS.OK,
			message: "Newsletters retrieved successfully",
			data: newsletters,
		});
	} catch (error) {
		console.error("Error fetching newsletters:", error);
		return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
			status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
			message: "Failed to retrieve newsletters",
			error: error.message,
		});
	}
};

const getNewsletter = async (req, res) => {
	try {
		const { id } = req.params;
		const newsletter = await getNewsletterById(id);
		return res.status(HTTP_STATUS.OK).json({
			status: HTTP_STATUS.OK,
			message: "Newsletter retrieved successfully",
			data: newsletter,
		});
	} catch (error) {
		console.error("Error fetching newsletter:", error);
		return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
			status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
			message: "Failed to retrieve newsletter",
			error: error.message,
		});
	}
};

const generateNewsletter = async (req, res) => {
	try {
		console.log('Starting newsletter generation...');
		
		// Import the simplified newsletter generator
		const { generateNewsletter: nodeGenerateNewsletter } = await import('../../utils/newsletterGeneratorSimple.js');
		
		// Generate newsletter using Node.js
		const newsletterContent = await nodeGenerateNewsletter();
		
		if (!newsletterContent) {
			return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
				status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
				message: "Failed to generate newsletter content",
			});
		}
		
		// Fetch the latest newsletter from database
		try {
			const newsletters = await getIndianFinanceNewsletters();
			const latestNewsletter = newsletters[0];

			return res.status(HTTP_STATUS.OK).json({
				status: HTTP_STATUS.OK,
				message: "Newsletter generated successfully",
				data: latestNewsletter,
			});
		} catch (dbError) {
			console.error("Error fetching generated newsletter:", dbError);
			return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
				status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
				message: "Newsletter generated but failed to retrieve",
				error: dbError.message,
			});
		}
	} catch (error) {
		console.error("Error in newsletter generation:", error);
		return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
			status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
			message: "Failed to generate newsletter",
			error: error.message,
		});
	}
};

const getAllIndianFinanceNewsletters = async (req, res) => {
	try {
		const newsletters = await getIndianFinanceNewsletters();
		return res.status(HTTP_STATUS.OK).json({
			status: HTTP_STATUS.OK,
			message: "Indian Finance Newsletters retrieved successfully",
			data: newsletters,
		});
	} catch (error) {
		console.error("Error fetching Indian Finance newsletters:", error);
		return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
			status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
			message: "Failed to retrieve Indian Finance newsletters",
			error: error.message,
		});
	}
};

const getIndianFinanceNewsletter = async (req, res) => {
	try {
		const { id } = req.params;
		const newsletter = await getIndianFinanceNewsletterById(id);
		return res.status(HTTP_STATUS.OK).json({
			status: HTTP_STATUS.OK,
			message: "Indian Finance Newsletter retrieved successfully",
			data: newsletter,
		});
	} catch (error) {
		console.error("Error fetching Indian Finance newsletter:", error);
		return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
			status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
			message: "Failed to retrieve Indian Finance newsletter",
			error: error.message,
		});
	}
};

const getIndianFinanceNewsletterHTML = async (req, res) => {
	try {
		const { id } = req.params;
		const newsletter = await getIndianFinanceNewsletterById(id);

		// Generate HTML
		let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${newsletter.title}</title>
    <style>
        @import url('https://api.fontshare.com/v2/css?f[]=trench-slab@500&f[]=general-sans@400&display=swap');
        
        * {
            font-family: 'General Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        h1, h2, h3, h4, h5, h6 {
            font-family: 'Trench Slab', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        body {
            font-family: 'General Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background-color: #f9fafb;
            margin: 0;
            padding: 20px 0;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
        }
        .title {
            font-family: 'Trench Slab', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 36px;
            font-weight: 500;
            color: #111827;
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 3px solid #059669;
            padding-bottom: 20px;
        }
        .date {
            font-family: 'General Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 14px;
            color: #6b7280;
            text-align: center;
            margin-bottom: 40px;
        }
        .heading {
            font-family: 'Trench Slab', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 24px;
            font-weight: 500;
            color: #1f2937;
            margin-bottom: 20px;
            border-bottom: 2px solid #059669;
            padding-bottom: 10px;
            margin-top: 40px;
        }
        .subheading {
            font-family: 'Trench Slab', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 18px;
            font-weight: 500;
            color: #374151;
            margin-bottom: 10px;
            margin-top: 30px;
        }
        .content {
            font-family: 'General Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 16px;
            font-weight: 400;
            line-height: 1.6;
            color: #4b5563;
            text-align: justify;
            margin-bottom: 30px;
        }
        .footer {
            font-family: 'General Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            margin-top: 60px;
            padding-top: 30px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="title">${newsletter.title}</h1>
        <p class="date">${new Date(newsletter.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}</p>`;;

		for (let i = 1; i <= 5; i++) {
			const heading = newsletter[`heading_${i}`];
			if (heading) {
				html += `<h2 class="heading">${heading}</h2>`;
				for (let j = 1; j <= 5; j++) {
					const subheading = newsletter[`heading_${i}_subheading_${j}`];
					const content = newsletter[`heading_${i}_subheading_${j}_content`];
					if (subheading && content) {
						html += `<h3 class="subheading">${subheading}</h3>`;
						html += `<p class="content">${content}</p>`;
					}
				}
			}
		}

		html += `
        <div class="footer">
            <p>Xtin Capital - Financial News Made Simple</p>
            <p>Stay informed with the latest Indian finance insights.</p>
        </div>
    </div>
</body>
</html>`;

		res.setHeader('Content-Type', 'text/html');
		return res.status(HTTP_STATUS.OK).send(html);
	} catch (error) {
		console.error("Error generating newsletter HTML:", error);
		return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
			status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
			message: "Failed to generate newsletter HTML",
			error: error.message,
		});
	}
};

const sendTestNewsletterEmail = async (req, res) => {
	try {
		const { id, email } = req.body;

		// Get newsletter data
		const newsletter = await getIndianFinanceNewsletterById(id);

		// Generate HTML
		let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${newsletter.title}</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px 0; }
        .container { max-width: 800px; margin: 0 auto; background-color: #ffffff; padding: 40px; }
        .title { font-size: 36px; font-weight: bold; color: #111827; text-align: center; margin-bottom: 20px; border-bottom: 3px solid #059669; padding-bottom: 20px; }
        .date { font-size: 14px; color: #6b7280; text-align: center; margin-bottom: 40px; }
        .heading { font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 20px; border-bottom: 2px solid #059669; padding-bottom: 10px; margin-top: 40px; }
        .subheading { font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 10px; margin-top: 30px; }
        .content { font-size: 16px; line-height: 1.6; color: #4b5563; text-align: justify; }
        .footer { margin-top: 60px; padding-top: 30px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="title">${newsletter.title}</h1>
        <p class="date">${new Date(newsletter.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>`;

		for (let i = 1; i <= 5; i++) {
			const heading = newsletter[`heading_${i}`];
			if (heading) {
				html += `<h2 class="heading">${heading}</h2>`;
				for (let j = 1; j <= 5; j++) {
					const subheading = newsletter[`heading_${i}_subheading_${j}`];
					const content = newsletter[`heading_${i}_subheading_${j}_content`];
					if (subheading && content) {
						html += `<h3 class="subheading">${subheading}</h3><p class="content">${content}</p>`;
					}
				}
			}
		}

		html += `<div class="footer"><p>Xtin Capital - Financial News Made Simple</p><p>Stay informed with the latest Indian finance insights.</p></div></div></body></html>`;

		// For testing: Log the email instead of sending (replace with actual email service)
		console.log('=== TEST EMAIL ===');
		console.log('To:', email);
		console.log('Subject:', newsletter.title);
		console.log('HTML Length:', html.length);
		console.log('HTML Preview:', html.substring(0, 500) + '...');
		console.log('==================');

		// Simulate sending (replace with actual transporter)
		// const transporter = nodemailer.createTransporter({...});
		// await transporter.sendMail({...});

		return res.status(HTTP_STATUS.OK).json({
			status: HTTP_STATUS.OK,
			message: "Test newsletter email sent successfully",
		});
	} catch (error) {
		console.error("Error sending test newsletter email:", error);
		return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
			status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
			message: "Failed to send test newsletter email",
			error: error.message,
		});
	}
};

const sendNewsletterToAllSubscribers = async (req, res) => {
	try {
		const { id } = req.body;

		// Get newsletter data
		const newsletter = await getIndianFinanceNewsletterById(id);

		// Get all subscribers
		const subscribers = await readSubscribers();
		const emails = subscribers.map(sub => sub.email);

		// Generate HTML
		let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${newsletter.title}</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px 0; }
        .container { max-width: 800px; margin: 0 auto; background-color: #ffffff; padding: 40px; }
        .title { font-size: 36px; font-weight: bold; color: #111827; text-align: center; margin-bottom: 20px; border-bottom: 3px solid #059669; padding-bottom: 20px; }
        .date { font-size: 14px; color: #6b7280; text-align: center; margin-bottom: 40px; }
        .heading { font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 20px; border-bottom: 2px solid #059669; padding-bottom: 10px; margin-top: 40px; }
        .subheading { font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 10px; margin-top: 30px; }
        .content { font-size: 16px; line-height: 1.6; color: #4b5563; text-align: justify; }
        .footer { margin-top: 60px; padding-top: 30px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="title">${newsletter.title}</h1>
        <p class="date">${new Date(newsletter.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>`;

		for (let i = 1; i <= 5; i++) {
			const heading = newsletter[`heading_${i}`];
			if (heading) {
				html += `<h2 class="heading">${heading}</h2>`;
				for (let j = 1; j <= 5; j++) {
					const subheading = newsletter[`heading_${i}_subheading_${j}`];
					const content = newsletter[`heading_${i}_subheading_${j}_content`];
					if (subheading && content) {
						html += `<h3 class="subheading">${subheading}</h3><p class="content">${content}</p>`;
					}
				}
			}
		}

		html += `<div class="footer"><p>Xtin Capital - Financial News Made Simple</p><p>Stay informed with the latest Indian finance insights.</p></div></div></body></html>`;

		// Send to all emails
		await sendEmailToAll(emails, newsletter.title, html);

		return res.status(HTTP_STATUS.OK).json({
			status: HTTP_STATUS.OK,
			message: "Newsletter sent to all subscribers successfully",
		});
	} catch (error) {
		console.error("Error sending newsletter to all subscribers:", error);
		return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
			status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
			message: "Failed to send newsletter to all subscribers",
			error: error.message,
		});
	}
};

const getCronStatus = async (req, res) => {
	try {
		const execState = await getExecutionState();
		const status = {
			provider: 'in-process node-cron (+ optional external HTTP trigger)',
			inProcessCronEnabled: process.env.DISABLE_NEWSLETTER_CRON !== 'true',
			morningSchedule: '8:00 AM IST (cron: 0 8 * * *, TZ Asia/Kolkata)',
			eveningSchedule: '5:00 PM IST (cron: 0 17 * * *, TZ Asia/Kolkata)',
			triggerEndpoint: 'POST /api/trigger-newsletter?token=CRON_SECRET_TOKEN',
			serverTime: new Date().toISOString(),
			serverTimeIST: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
			rateLimiting: {
				enabled: true,
				minIntervalMinutes: execState.minIntervalMinutes,
				currentlyRunning: execState.currentlyRunning,
				lastExecution: execState.lastExecution,
			},
			executionHistory: execState.executionHistory,
		};
		return res.status(HTTP_STATUS.OK).json({
			status: HTTP_STATUS.OK,
			message: "Newsletter cron status retrieved successfully",
			data: status,
		});
	} catch (error) {
		console.error("Error fetching cron status:", error);
		return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
			status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
			message: "Failed to retrieve cron status",
			error: error.message,
		});
	}
};

const triggerNewsletterGeneration = async (req, res) => {
	try {
		// Verify cron secret token if provided
		const cronSecret = process.env.CRON_SECRET_TOKEN;
		const token = req.query.token || req.headers['x-cron-token'];
		
		if (cronSecret && token !== cronSecret) {
			return res.status(HTTP_STATUS.UNAUTHORIZED).json({
				status: HTTP_STATUS.UNAUTHORIZED,
				message: "Invalid cron token",
			});
		}

		console.log('[Cron Trigger] Received newsletter trigger request...');

		// Delegate to the shared runner (handles the lock + 15-min rate limit).
		const result = await runNewsletterJob({ source: 'http-trigger' });

		// Return 200 even when skipped so cron-job.org doesn't treat it as a
		// failure and retry (cron-job.org treats non-2xx as failure).
		if ('skipped' in result) {
			console.log('[Cron Trigger] ⚠️ Skipped:', result.reason);
			return res.status(HTTP_STATUS.OK).json({
				status: HTTP_STATUS.OK,
				message: result.reason,
				skipped: true,
				retryAfter: result.retryAfter,
				lastResult: result.lastResult,
				timestamp: result.timestamp,
			});
		}

		return res.status(HTTP_STATUS.OK).json({
			status: HTTP_STATUS.OK,
			message: result.success
				? "Newsletter generated and sent successfully"
				: "Newsletter run completed with errors",
			data: result,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("[Cron Trigger] Newsletter failed:", error);
		return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
			status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
			message: "Failed to generate/send newsletter",
			error: error.message,
		});
	}
};

const MANUAL_EDITIONS = ["pre_market", "post_market"];

// Admin "send now" — starts one edition in the background and returns at
// once; the admin page polls adminNewsletterStatus for the outcome. The same
// lock + 15-minute rate limit as the scheduled runs apply.
const adminRunNewsletter = async (req, res) => {
	try {
		const { edition } = req.body || {};
		if (!MANUAL_EDITIONS.includes(edition)) {
			return res.status(HTTP_STATUS.BAD_REQUEST).json({
				status: HTTP_STATUS.BAD_REQUEST,
				message: `edition must be one of: ${MANUAL_EDITIONS.join(", ")}`,
			});
		}

		const result = await startNewsletterJobInBackground({
			source: `admin-manual:${edition}:${req.user.email}`,
			edition,
		});

		if ("skipped" in result) {
			return res.status(409).json({
				status: 409,
				message: result.reason,
				retryAfter: result.retryAfter,
			});
		}

		return res.status(202).json({
			status: 202,
			message: "Newsletter run started",
			data: result,
		});
	} catch (error) {
		console.error("Error starting manual newsletter run:", error);
		return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
			status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
			message: "Failed to start newsletter run",
			error: error.message,
		});
	}
};

const adminNewsletterStatus = async (req, res) => {
	try {
		const state = await getExecutionState();
		return res.status(HTTP_STATUS.OK).json({
			status: HTTP_STATUS.OK,
			data: { ...state, serverTime: new Date().toISOString() },
		});
	} catch (error) {
		console.error("Error fetching newsletter status:", error);
		return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
			status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
			message: "Failed to fetch newsletter status",
			error: error.message,
		});
	}
};

export {
	adminRunNewsletter,
	adminNewsletterStatus,
	getAllNewsletters,
	getNewsletter,
	generateNewsletter,
	getAllIndianFinanceNewsletters,
	getIndianFinanceNewsletter,
	getIndianFinanceNewsletterHTML,
	sendTestNewsletterEmail,
	sendNewsletterToAllSubscribers,
	getCronStatus,
	triggerNewsletterGeneration,
};