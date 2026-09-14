import supabase from "../../supabase/index.js";

const saveUser = async (userData) => {
	try {
		console.log('Attempting to save user:', userData);
		// First, try to find existing user by auth_id
		const { data: existingUser, error: fetchError } = await supabase
			.from('users')
			.select('*')
			.eq('auth_id', userData.auth_id)
			.single();
		console.log('Existing user check:', { existingUser, fetchError });

		if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
			throw fetchError;
		}

		let result;
		if (existingUser) {
			// Update existing user
			const { data, error } = await supabase
				.from('users')
				.update({
					first_name: userData.first_name,
					last_name: userData.last_name,
					email: userData.email,
					phone_number: userData.phone_number
				})
				.eq('auth_id', userData.auth_id)
				.select()
				.single();

			if (error) throw error;
			result = data;
		} else {
			// Insert new user
			const { data, error } = await supabase
				.from('users')
				.insert({
					auth_id: userData.auth_id,
					first_name: userData.first_name,
					last_name: userData.last_name,
					email: userData.email,
					phone_number: userData.phone_number
				})
				.select()
				.single();

			if (error) throw error;
			result = data;
		}

		return result;
	} catch (error) {
		console.error('Save user error:', error);
		console.error('Error details:', JSON.stringify(error, null, 2));
		throw error;
	}
};

const getUserById = async (id) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') { // No rows returned
                return {
                    user: null,
                    error: {
                        statusCode: 404,
                        message: "User not found"
                    }
                };
            }
            throw error;
        }

        return { user: data, error: null };

    } catch (error) {
        console.error("[Repository Error] getUserById:", error);
        return {
            user: null,
            error: {
                statusCode: 500,
                message: "Internal server error"
            }
        };
    }
};

const getUserByAuthId = async (authId) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', authId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }
            throw error;
        }
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const getUserByEmail = async (email) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }
            throw error;
        }
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const checkUserExists = async (email) => {
    try {
        const user = await getUserByEmail(email);
        return user;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const signUpWithSupabaseAuth = ({ email, password, first_name, last_name, phone_number }) =>
    supabase.auth.signUp({
        email,
        password,
        options: {
            data: { first_name, last_name, phone_number },
        },
    });

const signInWithSupabaseAuth = ({ email, password }) =>
    supabase.auth.signInWithPassword({ email, password });

const getSupabaseAuthUser = (token) => supabase.auth.getUser(token);

const getUserProfileById = (userId) =>
    supabase
        .from('users')
        .select('id, email, first_name, last_name, phone_number, created_at')
        .eq('id', userId)
        .single();

const updateUserProfileById = (userId, updateData) =>
    supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select('id, email, first_name, last_name, phone_number')
        .single();

export {
    saveUser,
    getUserById,
    getUserByAuthId,
    getUserByEmail,
    checkUserExists,
    signUpWithSupabaseAuth,
    signInWithSupabaseAuth,
    getSupabaseAuthUser,
    getUserProfileById,
    updateUserProfileById,
};