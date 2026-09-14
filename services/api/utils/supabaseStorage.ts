import supabase from "../supabase/index.js";

const uploadBufferToSupabase = async ({ filename, buffer, contentType, bucket = 'uploads' }) => {
	try {
		// Generate a unique filename to avoid conflicts
		const fileExt = filename.split('.').pop();
		const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

		const { data, error } = await supabase.storage
			.from(bucket)
			.upload(fileName, buffer, {
				contentType,
				upsert: false
			});

		if (error) throw error;

		// Get the public URL
		const { data: urlData } = supabase.storage
			.from(bucket)
			.getPublicUrl(fileName);

		return {
			id: data.path, // Use the path as ID
			url: urlData.publicUrl
		};
	} catch (error) {
		console.error('Error uploading to Supabase Storage:', error);
		throw error;
	}
};

const deleteFromSupabase = async (filePath, bucket = 'uploads') => {
	try {
		const { error } = await supabase.storage
			.from(bucket)
			.remove([filePath]);

		if (error) throw error;
		return true;
	} catch (error) {
		console.error('Error deleting from Supabase Storage:', error);
		throw error;
	}
};

const getPublicUrl = (filePath, bucket = 'uploads') => {
	const { data } = supabase.storage
		.from(bucket)
		.getPublicUrl(filePath);

	return data.publicUrl;
};

export { uploadBufferToSupabase, deleteFromSupabase, getPublicUrl };