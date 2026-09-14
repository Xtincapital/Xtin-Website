import { z } from "zod";
import { trimStrings } from "../../utils/helper_functions.js";
import { REGEX } from "../../constants/constants.js";

const metricSchema = z.object({
	trading_volume: z
		.number()
		.min(1, "Trading volume must be at least 1")
		.max(10000000000, "Trading volume must be at most 10000000000")
		.describe("Trading volume in USD"),
	active_traders: z
		.number()
		.min(1, "Active traders must be at least 1")
		.max(1000000, "Active traders must be at most 1000000")
		.describe("Active traders"),
	uptime: z
		.number()
		.min(1, "Uptime must be at least 1")
		.max(100, "Uptime must be at most 100")
		.describe("Uptime in percentage"),
	avg_latency: z
		.number()
		.min(0, "Average latency must be at least 0")
		.max(1000000, "Average latency must be at most 1000000")
		.describe("Average latency in ms"),
});

const validateMetricSchema = (metric) => {
	const trimmedMetric = trimStrings(metric);
	const result = metricSchema.safeParse(trimmedMetric);
	if (!result.success) {
		const errorsMessages = result.error.issues.map(
			(issue) => issue.message
		);
		return {
			errors: errorsMessages,
			message: "Metric validation failed",
		};
	}
	return {
		data: result.data,
		message: "Metric validated successfully",
	};
};
export { validateMetricSchema };
