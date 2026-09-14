import axios from "axios";
import { HTTP_STATUS } from "../../constants/constants.js";

// ============================================================
// SUBSTACK ARCHIVE PROXY
// Fetches articles from the Substack publication's public API.
// Browsers can't call Substack directly (no CORS headers), so we
// proxy + normalize the response here.
// ============================================================

const SUBSTACK_BASE_URL =
	process.env.SUBSTACK_URL || "https://chetandugar.substack.com";

const REQUEST_HEADERS = {
	"User-Agent":
		"Mozilla/5.0 (compatible; XtinCapital/1.0; +https://www.xtincapital.com)",
	Accept: "application/json",
};

// Simple in-memory cache to avoid hammering Substack on every page load.
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const cache = {
	list: { data: null, fetchedAt: 0 },
	posts: new Map(), // slug -> { data, fetchedAt }
};

// Strip the Substack origin and keep only the canonical slug.
const slugFromCanonical = (url) => {
	if (!url) return null;
	const match = url.match(/\/p\/([^/?#]+)/);
	return match ? match[1] : null;
};

// Trim the normalized fields we expose to the client (archive list view).
const normalizeListItem = (post) => ({
	id: post.id,
	slug: post.slug || slugFromCanonical(post.canonical_url),
	title: post.title,
	subtitle: post.subtitle || post.description || "",
	coverImage: post.cover_image || null,
	postDate: post.post_date,
	canonicalUrl: post.canonical_url,
	audience: post.audience, // "everyone" | "only_paid" | "founding"
	isPaid: post.audience && post.audience !== "everyone",
	wordcount: post.wordcount || null,
	reactionCount: post.reaction_count || 0,
	commentCount: post.comment_count || 0,
	type: post.type, // newsletter | podcast | thread
	author:
		post.publishedBylines?.[0]?.name ||
		post.publishedBylines?.[0]?.handle ||
		null,
});

// Get the full list of articles from the Substack archive.
const getSubstackArticles = async (req, res) => {
	try {
		const now = Date.now();
		if (cache.list.data && now - cache.list.fetchedAt < CACHE_TTL_MS) {
			return res.status(HTTP_STATUS.OK).json({
				status: HTTP_STATUS.OK,
				message: "Substack articles retrieved successfully (cached)",
				data: cache.list.data,
			});
		}

		// Page through the archive so we get every article, not just the latest 10.
		const all = [];
		const limit = 50;
		let offset = 0;
		// Hard cap to avoid runaway loops on very large publications.
		for (let page = 0; page < 20; page++) {
			const { data } = await axios.get(
				`${SUBSTACK_BASE_URL}/api/v1/archive`,
				{
					params: { sort: "new", limit, offset },
					headers: REQUEST_HEADERS,
					timeout: 15000,
				}
			);
			if (!Array.isArray(data) || data.length === 0) break;
			all.push(...data);
			if (data.length < limit) break;
			offset += limit;
		}

		const articles = all
			.filter((p) => p && p.title)
			.map(normalizeListItem);

		cache.list = { data: articles, fetchedAt: now };

		return res.status(HTTP_STATUS.OK).json({
			status: HTTP_STATUS.OK,
			message: "Substack articles retrieved successfully",
			data: articles,
		});
	} catch (error) {
		console.error("Error fetching Substack articles:", error.message);
		return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
			status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
			message: "Failed to retrieve Substack articles",
			error: error.message,
		});
	}
};

// Get a single article (with full body HTML) by slug for the in-app reader.
const getSubstackArticleBySlug = async (req, res) => {
	try {
		const { slug } = req.params;
		if (!slug) {
			return res.status(HTTP_STATUS.BAD_REQUEST).json({
				status: HTTP_STATUS.BAD_REQUEST,
				message: "Article slug is required",
			});
		}

		const now = Date.now();
		const cached = cache.posts.get(slug);
		if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
			return res.status(HTTP_STATUS.OK).json({
				status: HTTP_STATUS.OK,
				message: "Substack article retrieved successfully (cached)",
				data: cached.data,
			});
		}

		const { data: post } = await axios.get(
			`${SUBSTACK_BASE_URL}/api/v1/posts/${encodeURIComponent(slug)}`,
			{ headers: REQUEST_HEADERS, timeout: 15000 }
		);

		const article = {
			...normalizeListItem(post),
			bodyHtml: post.body_html || "",
			// Paid posts only expose a truncated preview via the public API.
			truncated: Boolean(post.audience && post.audience !== "everyone"),
		};

		cache.posts.set(slug, { data: article, fetchedAt: now });

		return res.status(HTTP_STATUS.OK).json({
			status: HTTP_STATUS.OK,
			message: "Substack article retrieved successfully",
			data: article,
		});
	} catch (error) {
		const notFound = error.response?.status === 404;
		const code = notFound
			? HTTP_STATUS.NOT_FOUND
			: HTTP_STATUS.INTERNAL_SERVER_ERROR;
		console.error("Error fetching Substack article:", error.message);
		return res.status(code).json({
			status: code,
			message: notFound
				? "Substack article not found"
				: "Failed to retrieve Substack article",
			error: error.message,
		});
	}
};

export { getSubstackArticles, getSubstackArticleBySlug };
