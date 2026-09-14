import supabase from "../../supabase/index.js";

const getNewsletters = async () => {
	try {
		const { data, error } = await supabase
			.from('newsletters')
			.select('*')
			.order('created_at', { ascending: false });

		if (error) throw error;
		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

const getNewsletterById = async (id) => {
	try {
		const { data, error } = await supabase
			.from('newsletters')
			.select('*')
			.eq('id', id)
			.single();

		if (error) throw error;
		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

const createNewsletter = async (newsletter) => {
	try {
		const { data, error } = await supabase
			.from('newsletters')
			.insert([newsletter])
			.select()
			.single();

		if (error) throw error;
		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

const getIndianFinanceNewsletters = async () => {
	try {
		const { data, error } = await supabase
			.from('indian_finance_newsletter')
			.select('*')
			.order('created_at', { ascending: false });

		if (error) throw error;
		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

const getIndianFinanceNewsletterById = async (id) => {
	try {
		const { data, error } = await supabase
			.from('indian_finance_newsletter')
			.select('*')
			.eq('id', id)
			.single();

		if (error) throw error;
		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

const createIndianFinanceNewsletter = async (newsletter) => {
	try {
		const { data, error } = await supabase
			.from('indian_finance_newsletter')
			.insert([newsletter])
			.select()
			.single();

		if (error) throw error;
		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export { getNewsletters, getNewsletterById, createNewsletter, getIndianFinanceNewsletters, getIndianFinanceNewsletterById, createIndianFinanceNewsletter };