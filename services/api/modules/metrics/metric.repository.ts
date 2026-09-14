import supabase from "../../supabase/index.js";

const readMetric = async () => {
	try {
		const { data, error } = await supabase
			.from('home_page_metrics')
			.select('*')
			.single();

		if (error) {
			if (error.code === 'PGRST116') return null;
			throw error;
		}
		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

const checkMetricExists = async () => {
	try {
		const metric = await readMetric();
		return !!metric;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

const createMetric = async (metric) => {
	try {
		const { data, error } = await supabase
			.from('home_page_metrics')
			.insert([metric])
			.select()
			.single();

		if (error) throw error;
		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

const updateMetric = async (metric) => {
	try {
		const { data, error } = await supabase
			.from('home_page_metrics')
			.update(metric)
			.select()
			.single();

		if (error) throw error;
		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export { readMetric, createMetric, updateMetric, checkMetricExists };
