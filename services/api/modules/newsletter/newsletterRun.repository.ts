import supabase from "../../supabase/index.js";

// Most recent run, regardless of status — used to decide whether a new
// execution is allowed (mirrors the old in-memory cronExecutionStore).
const getLatestRun = () =>
	supabase
		.from("newsletter_runs")
		.select("id, status, started_at, completed_at, result")
		.order("started_at", { ascending: false })
		.limit(1)
		.maybeSingle();

const startRun = (source: string) =>
	supabase
		.from("newsletter_runs")
		.insert({ source, status: "running" })
		.select("id")
		.single();

const completeRun = (id: string, status: "success" | "failed", result: unknown) =>
	supabase
		.from("newsletter_runs")
		.update({ status, result: result as object, completed_at: new Date().toISOString() })
		.eq("id", id);

const getRecentRuns = (limit = 10) =>
	supabase
		.from("newsletter_runs")
		.select("source, status, result, started_at, completed_at")
		.order("started_at", { ascending: false })
		.limit(limit);

export { getLatestRun, startRun, completeRun, getRecentRuns };
