import supabase from '../../supabase/index.js';

const createSupportTicket = async ({ name, email, phone, subject, message }) => {
	const { data, error } = await supabase
		.from('support_tickets')
		.insert({ name, email, phone, subject, message })
		.select()
		.single();

	if (error) throw error;
	return data;
};

export { createSupportTicket };
