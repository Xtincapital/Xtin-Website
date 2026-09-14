import supabase from "../../supabase/index.js";

const availableCourses = async () => {
	try {
		const { data, error } = await supabase
			.from('courses')
			.select('id, course_id, title, description, price, thumbnail')
			.eq('is_published', true);

		if (error) throw error;
		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

const purchasedCourses = async (userId) => {
	try {
		// First get purchase IDs
		const { data: purchases, error: purchaseError } = await supabase
			.from('purchases')
			.select('course_id')
			.eq('user_id', userId);

		if (purchaseError) throw purchaseError;

		if (!purchases || purchases.length === 0) return [];

		const courseIds = purchases.map(p => p.course_id);

		// Get course details with videos and slides
		const { data: courses, error: courseError } = await supabase
			.from('courses')
			.select(`
				id,
				course_id,
				title,
				description,
				thumbnail,
				price,
				videos (url),
				slides (url)
			`)
			.in('id', courseIds)
			.eq('is_published', true);

		if (courseError) throw courseError;
		return courses || [];
	} catch (error) {
		console.error(error);
		throw error;
	}
};

const purchasedCourseById = async (userId, courseId) => {
	try {
		// Check if user has purchased this course
		const { data: purchase, error: purchaseError } = await supabase
			.from('purchases')
			.select('id')
			.eq('user_id', userId)
			.eq('course_id', courseId)
			.single();

		if (purchaseError || !purchase) return null;

		// Get course details
		const { data: course, error: courseError } = await supabase
			.from('courses')
			.select(`
				id,
				course_id,
				title,
				description,
				thumbnail,
				price,
				videos (url),
				slides (url)
			`)
			.eq('id', courseId)
			.eq('is_published', true)
			.single();

		if (courseError) throw courseError;
		return course || null;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

const purchaseCourseById = async (
	userId,
	courseId,
	transactionId,
	pricePaid,
	paymentMethod,
	purchasedAt
) => {
	try {
		const { data, error } = await supabase
			.from('purchases')
			.insert([{
				user_id: userId,
				course_id: courseId,
				transaction_id: transactionId,
				price_paid: pricePaid,
				payment_method: paymentMethod,
				purchased_at: purchasedAt
			}])
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
	availableCourses,
	purchasedCourses,
	purchasedCourseById,
	purchaseCourseById,
};
