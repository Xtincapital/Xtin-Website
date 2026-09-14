import supabase from "../../supabase/index.js";

const readSubscribers = async () => {
	try {
		const { data, error } = await supabase
			.from('subscriptions')
			.select('*');

		if (error) throw error;
		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

const createSubscriber = async (subscriber) => {
	try {
		let { data, error } = await supabase
			.from('subscriptions')
			.insert([subscriber])
			.select()
			.single();

		// The `markets` column ships with database/newsletter_pro_plans.sql; if
		// that migration hasn't run yet, retry without it so signup never breaks.
		if (error && /column|schema/i.test(error.message || '') && subscriber.markets) {
			const { markets, ...rest } = subscriber;
			({ data, error } = await supabase
				.from('subscriptions')
				.insert([rest])
				.select()
				.single());
		}

		if (error) throw error;
		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

const updateSubscriberMarkets = async (email, markets) => {
	const { data, error } = await supabase
		.from('subscriptions')
		.update({ markets })
		.eq('email', email)
		.select()
		.maybeSingle();
	if (error) throw error;
	return data;
};

const getSubscriberByEmail = async (email) => {
	const { data, error } = await supabase
		.from('subscriptions')
		.select('*')
		.eq('email', email)
		.maybeSingle();
	if (error) throw error;
	return data;
};

const deleteSubscriber = async (email) => {
	try {
		const { data, error } = await supabase
			.from('subscriptions')
			.delete()
			.eq('email', email)
			.select()
			.single();

		if (error) throw error;
		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export {
	readSubscribers,
	createSubscriber,
	deleteSubscriber,
	updateSubscriberMarkets,
	getSubscriberByEmail,
};
