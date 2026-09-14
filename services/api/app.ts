import express from "express";
import cors from "cors";
import compression from "compression";
import authRoutes from "./modules/auth/user.routes.js";
import courseRoutes from "./modules/academy/course.routes.js";
import progressRoutes from "./modules/academy/progress.routes.js";
import learnRoutes from "./modules/academy/learn.routes.js";
import newsletterPlanRoutes from "./modules/newsletter/newsletterPlan.routes.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";

import metricRoutes from "./modules/metrics/metric.routes.js";
import subscriptionRoutes from "./modules/newsletter/subscription.routes.js";
import helpRoutes from "./modules/help/help.routes.js";
import aiRoutes from "./modules/ai/ai.routes.js";
import newsletterRoutes from "./modules/newsletter/newsletter.routes.js";
import substackRoutes from "./modules/newsletter/substack.routes.js";
import algorithmRoutes from "./modules/algos/algorithm.routes.js";
import certificateRoutes from "./modules/certificates/certificate.routes.js";
import path from "path";
import fileRoutes from "./modules/files/files.routes.js";
import subscriptionPlanRoutes from "./modules/billing/subscriptionPlan.routes.js";

const app = express();

// Security Headers - Critical for SEO and crawlability (Google crawlers respect security headers)
app.use((req, res, next) => {
	// HSTS: Enforce HTTPS - Improves security score and crawl efficiency
	res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
	// X-Frame-Options: Prevent clickjacking - Allows controlled iframe loading
	res.setHeader('X-Frame-Options', 'SAMEORIGIN');
	// X-Content-Type-Options: Prevent MIME sniffing - Ensures content types are respected
	res.setHeader('X-Content-Type-Options', 'nosniff');
	// Referrer Policy: Controls referrer information - Important for analytics
	res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
	next();
});

// Parse JSON with higher limit for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Note: Static files for gini and journal are served by the frontend
// app.use('/gini', express.static(path.join(process.cwd(), '../../apps/web/public/gini')));
// app.use('/journal', express.static(path.join(process.cwd(), '../../apps/web/public/journal')));

// CORS Configuration - Production-ready with proper origin validation
const allowedOrigins = [
	'http://localhost:3001',
	'http://localhost:5173',
	'http://localhost:5174',
	'http://127.0.0.1:3001',
	'http://127.0.0.1:5173',
	'http://127.0.0.1:5174',
	'https://xtincapital.com',
	'https://www.xtincapital.com',
	'https://xtin-website-web.vercel.app'
];

app.use(cors({
	origin: function(origin, callback) {
		// Allow requests with no origin (mobile apps, curl, etc.)
		if (!origin || allowedOrigins.includes(origin)) {
			callback(null, true);
		} else {
			callback(new Error('CORS not allowed'));
		}
	},
	credentials: true,
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
	allowedHeaders: ["Content-Type", "Authorization", "Accept"],
	maxAge: 3600 // Cache preflight requests for 1 hour
}));

// Cache Control Middleware - Optimizes crawl budget and performance
app.use((req, res, next) => {
	if (req.method === 'GET') {
		// Static content and public data - cache aggressively
		if (req.path.startsWith('/api/courses') || req.path.startsWith('/api/metrics')) {
			res.set('Cache-Control', 'public, max-age=3600, s-maxage=86400'); // Cache 1h client, 24h CDN
			res.set('ETag', `"${Date.now()}"`); // Add ETag for cache validation
		}
		// Dynamic user data - no cache
		else if (req.path.startsWith('/api/')) {
			res.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
			res.set('Pragma', 'no-cache'); // HTTP/1.0 compatibility
			res.set('Expires', '0');
		}
		// Static assets served from frontend
		else {
			res.set('Cache-Control', 'public, max-age=86400, immutable');
		}
	} else {
		// Non-GET requests should never be cached
		res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
	}
	next();
});

// API Routes
app.use("/api", authRoutes);
app.use("/api", certificateRoutes);
app.use("/api", courseRoutes);
app.use("/api", progressRoutes);
app.use("/api", learnRoutes);
app.use("/api", newsletterPlanRoutes);
app.use("/api", metricRoutes);
app.use("/api", subscriptionRoutes);
app.use("/api", newsletterRoutes);
app.use("/api", substackRoutes);
app.use("/api", fileRoutes);
app.use("/api", helpRoutes);
app.use("/api", aiRoutes);
app.use("/api", algorithmRoutes);
app.use("/api", subscriptionPlanRoutes);

import { checkDatabaseHealth, checkStorageHealth } from "./utils/healthCheck.js";

// Health check endpoint with proper JSON structure
app.get("/", (req, res) => {
	res.status(200).set('Content-Type', 'application/json').json({
		status: 'success',
		message: "Xtin Capital API is Live",
		version: "2.0.0",
		database: "Supabase",
		timestamp: new Date().toISOString()
	});
});

// Detailed health check endpoint
app.get("/health", async (req, res) => {
	try {
		// Simplified health check for Render deployment
		res.status(200).json({
			status: 'healthy',
			message: "Xtin Capital API Health Check",
			version: "2.0.0",
			timestamp: new Date().toISOString(),
			environment: process.env.NODE_ENV || 'development'
		});
	} catch (error) {
		res.status(503).json({
			status: 'unhealthy',
			message: "Health check failed",
			error: error.message,
			timestamp: new Date().toISOString()
		});
	}
});

// Sitemap endpoint - Critical for search engine indexing
app.get("/sitemap.xml", (req, res) => {
	res.type('application/xml');
	res.setHeader('Cache-Control', 'public, max-age=604800'); // Cache for 1 week
	try {
		res.sendFile(path.join(process.cwd(), '../../apps/web/public/sitemap.xml'));
	} catch (err) {
		res.status(404).send('Sitemap not found');
	}
});

// Robots.txt endpoint - Essential for crawler directives
app.get("/robots.txt", (req, res) => {
	res.type('text/plain');
	res.setHeader('Cache-Control', 'public, max-age=604800'); // Cache for 1 week
	try {
		res.sendFile(path.join(process.cwd(), '../../apps/web/public/robots.txt'));
	} catch (err) {
		res.status(404).send('Robots.txt not found');
	}
});

// Newsletter cron is handled externally via cron-job.org
// Trigger endpoint: POST /api/trigger-newsletter?token=CRON_SECRET_TOKEN

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

export { app };
