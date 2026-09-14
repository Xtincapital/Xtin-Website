import { HTTP_STATUS } from "../../constants/constants.js";
import {
	readSubscribers,
	createSubscriber,
	deleteSubscriber,
} from "./subscription.repository.js";
import { validateSubscription } from "./subscription.validator.js";

const readSubscribersController = async (req, res) => {
	try {
		const subscribers = await readSubscribers();
		res.status(HTTP_STATUS.OK).json({
			status: HTTP_STATUS.OK,
			message: "Subscribers read successfully",
			data: subscribers,
		});
	} catch (error) {
		console.error(error);
		res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
			error: "Failed to read subscribers",
		});
	}
};

const createSubscriberController = async (req, res) => {
	try {
		const validation = validateSubscription(req.body);
		if (validation.errors) {
			return res.status(HTTP_STATUS.BAD_REQUEST).json({
				errors: validation.errors,
				message: validation.message,
			});
		}

		const subscriber = await createSubscriber(validation.data);
		res.status(HTTP_STATUS.CREATED).json({
			status: HTTP_STATUS.CREATED,
			message: "Subscriber created successfully",
			data: subscriber,
		});
	} catch (error) {
		console.error(error);
		const isDuplicateSubscriber =
			error?.code === "23505" ||
			/duplicate key value|unique constraint|already exists/i.test(error?.message || "");

		if (isDuplicateSubscriber) {
			return res.status(409).json({
				status: 409,
				message: "You are already subscribed to the newsletter.",
			});
		}

		res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
			message: "Failed to create subscriber",
		});
	}
};

const deleteSubscriberController = async (req, res) => {
	try {
		const { email } = req.body;
		const subscriber = await deleteSubscriber(email);
		res.status(HTTP_STATUS.OK).json({
			status: HTTP_STATUS.OK,
			message: "Subscriber deleted successfully",
			data: subscriber,
		});
	} catch (error) {
		console.error(error);
		res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
			error: "Failed to delete subscriber",
		});
	}
};

const unsubscribeSubscriberController = async (req, res) => {
	try {
		const email = String(req.query.email || '').trim();
		if (!email) {
			return res.status(HTTP_STATUS.BAD_REQUEST).send('Missing email parameter');
		}

		await deleteSubscriber(email);
		return res.status(HTTP_STATUS.OK).send('You have been unsubscribed from Xtin Capital newsletter.');
	} catch (error) {
		console.error(error);
		return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send('Failed to unsubscribe. Please contact support.');
	}
};

export {
	readSubscribersController,
	createSubscriberController,
	deleteSubscriberController,
	unsubscribeSubscriberController,
};
