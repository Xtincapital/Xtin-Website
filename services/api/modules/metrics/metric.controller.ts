import {
	readMetric,
	createMetric,
	updateMetric,
	checkMetricExists,
} from "./metric.repository.js";
import { HTTP_STATUS } from "../../constants/constants.js";
import { validateMetricSchema } from "./metric.validator.js";
const readMetricController = async (req, res) => {
	const metrics = await readMetric();
	return res.status(HTTP_STATUS.OK).json({
		status: HTTP_STATUS.OK,
		message: "Metrics retrieved successfully",
		data: metrics,
	});
};

const createMetricController = async (req, res) => {
	const validationResult = validateMetricSchema(req.body);
	if (validationResult.errors) {
		return res.status(HTTP_STATUS.BAD_REQUEST).json({
			errors: validationResult.errors,
			message: validationResult.message,
		});
	}
	const { trading_volume, active_traders, uptime, avg_latency } =
		validationResult.data;
	const metricExists = await checkMetricExists();
	console.log(metricExists);
	if (metricExists) {
		return res.status(HTTP_STATUS.BAD_REQUEST).json({
			status: HTTP_STATUS.BAD_REQUEST,
			message: "Metric already exists",
			data: null,
		});
	}
	const metric = await createMetric({
		trading_volume,
		active_traders,
		uptime,
		avg_latency,
		metric: "home_page_metrics",
	});
	return res.status(HTTP_STATUS.CREATED).json({
		status: HTTP_STATUS.CREATED,
		message: "Metric created successfully",
		data: metric,
	});
};

const updateMetricController = async (req, res) => {
	const updatedMetric = await updateMetric(req.body);
	return res.status(HTTP_STATUS.OK).json({
		status: HTTP_STATUS.OK,
		message: "Metric updated successfully",
		data: null,
	});
};
export { readMetricController, createMetricController, updateMetricController };
