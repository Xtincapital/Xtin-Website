// controllers/user.controllers.js
import supabase from "../../supabase/index.js";
import {
	validateUserSignup,
	validateUserLogin,
	type ValidationIssue,
} from "./user.validator.js";
import { HTTP_STATUS, MESSAGES } from "../../constants/constants.js";
import {
	checkUserExists,
	saveUser,
	getUserByEmail,
	getUserByAuthId,
	signUpWithSupabaseAuth,
	signInWithSupabaseAuth,
	getSupabaseAuthUser,
	getUserProfileById,
	updateUserProfileById,
} from "./user.repository.js";

// Client IP, for log lines only. Render sits behind a proxy and the app
// doesn't set `trust proxy`, so req.ip would be the proxy's address. Never
// use this for an access decision: the header can be set by the client.
const clientIp = (req) =>
	(req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() || req.ip;

// Structured log line for monitoring. Records which fields failed and why,
// never the submitted values (no passwords, emails or names in logs).
const logValidationFailure = (req, route: string, issues: ValidationIssue[]) => {
	console.warn("[AuthValidation] rejected", JSON.stringify({
		route,
		ip: clientIp(req),
		userAgent: req.headers["user-agent"],
		issues,
	}));
};

const logSanitized = (req, route: string, fields: string[]) => {
	if (fields.length === 0) return;
	console.warn("[AuthValidation] sanitized", JSON.stringify({
		route,
		ip: clientIp(req),
		fields,
	}));
};

// Signup controller - uses Supabase Auth
const signup = async (req, res) => {
	const validation = validateUserSignup(req.body);
	if (!validation.ok) {
		logValidationFailure(req, "signup", validation.issues);
		return res.status(HTTP_STATUS.BAD_REQUEST).json({
			status: HTTP_STATUS.BAD_REQUEST,
			message: validation.message,
			data: null,
		});
	}
	logSanitized(req, "signup", validation.sanitizedFields);
	const { first_name, last_name, email, phone_number, password } =
		validation.data;
	try {
		// Check if a user with this email already exists in our users table
		const existingUser = await checkUserExists(email);
		if (existingUser) {
			return res
				.status(400)
				.json({
					status: HTTP_STATUS.BAD_REQUEST,
					message: MESSAGES.USER_ALREADY_EXISTS,
					data: null,
				});
		}

		// Create user in Supabase Auth
		const { data: authData, error: authError } = await signUpWithSupabaseAuth({
			email,
			password,
			first_name,
			last_name,
			phone_number,
		});

		if (authError) {
			console.error('Supabase auth error:', authError);
			return res.status(400).json({
				status: HTTP_STATUS.BAD_REQUEST,
				message: authError.message,
				data: null,
			});
		}

		console.log('Supabase signup successful:', { userId: authData.user?.id, hasSession: !!authData.session });

		// Check if email confirmation is required
		if (!authData.session) {
			// Email confirmation required
			return res.status(200).json({
				status: HTTP_STATUS.OK,
				message: "Signup successful! Please check your email and click the confirmation link to complete your registration.",
				data: {
					email: email,
					requires_confirmation: true,
				},
			});
		}

		// Save additional user data to our users table
		let newUser = null;
		if (authData.user) {
			console.log('Saving user data:', { auth_id: authData.user.id });
			try {
				newUser = await saveUser({
					auth_id: authData.user.id,
					first_name,
					last_name,
					email,
					phone_number,
				});
				console.log('User saved successfully:', newUser);
			} catch (saveError) {
				console.error('Failed to save user to custom table:', saveError);
				console.error('Error details:', JSON.stringify(saveError, null, 2));
				// Continue anyway, the trigger should have created the profile
			}
		} else {
			console.log('No user in auth data, email confirmation might be required');
		}

		res.status(201).json({
			status: HTTP_STATUS.CREATED,
			message: "User created successfully",
			data: {
				id: newUser?.id || authData.user?.id,
				first_name: newUser?.first_name || first_name,
				last_name: newUser?.last_name || last_name,
				email: newUser?.email || email,
				phone_number: newUser?.phone_number || phone_number,
				token: authData.session?.access_token, // Include token if session exists
			},
		});
	} catch (error) {
		console.error('Signup error:', error);
		console.error('Error stack:', error.stack);

		// Handle specific database errors
		if (error.code === '23505') { // Unique violation
			if (error.message.includes('email')) {
				return res.status(400).json({
					status: HTTP_STATUS.BAD_REQUEST,
					message: "An account with this email already exists",
					data: null,
				});
			}
			if (error.message.includes('phone_number')) {
				return res.status(400).json({
					status: HTTP_STATUS.BAD_REQUEST,
					message: "An account with this phone number already exists",
					data: null,
				});
			}
		}

		// Generic server error
		res.status(500).json({
			status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
			message: "Database error saving new user",
		});
	}
};

// Login controller
const login = async (req, res) => {
	const validation = validateUserLogin(req.body);
	if (!validation.ok) {
		logValidationFailure(req, "login", validation.issues);
		return res.status(HTTP_STATUS.BAD_REQUEST).json({
			status: HTTP_STATUS.BAD_REQUEST,
			message: validation.message,
			data: null,
		});
	}
	const { email, password } = validation.data;

	try {
		// Sign in with Supabase Auth
		const { data: authData, error: authError } = await signInWithSupabaseAuth({
			email,
			password,
		});

		if (authError) {
			return res.status(400).json({
				status: HTTP_STATUS.BAD_REQUEST,
				message: "Invalid credentials",
				data: null,
			});
		}
		

		// Get user data from our users table
		const user = await getUserByAuthId(authData.user.id);
		if (!user) {
			return res.status(400).json({
				status: HTTP_STATUS.BAD_REQUEST,
				message: "User data not found",
				data: null,
			});
		}

		// No backend-minted JWT — the real credential is the Supabase session
		// token from signInWithSupabaseAuth above (same pattern signup() below
		// already used). The live frontend calls supabase.auth.signInWithPassword
		// directly and never hits this route, but it's kept functional (for any
		// caller that does use it) without reintroducing a second token type.
		return res.status(HTTP_STATUS.OK).json({
			status: HTTP_STATUS.OK,
			message: "Login successful",
			data: {
				token: authData.session?.access_token,
				userId: user.id,
				first_name: user.first_name,
				last_name: user.last_name,
				email: user.email,
				phone_number: user.phone_number,
			},
		});
	} catch (error) {
		console.error(error);
		return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
			status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
			message: MESSAGES.SERVER_ERROR,
		});
	}
};

// Sync user data after OAuth login
const syncUser = async (req, res) => {
	try {
		// Get the authenticated user from Supabase using the token
		const token = req.headers.authorization?.split(" ")[1];
		if (!token) {
			return res.status(401).json({ error: "No token provided" });
		}

		const { data: { user }, error: authError } = await getSupabaseAuthUser(token);
		if (authError || !user) {
			return res.status(401).json({ error: "Invalid token" });
		}

		// Check if custom user exists
		let customUser = await getUserByAuthId(user.id);
		if (!customUser) {
			// Create custom user from OAuth data
			// Handle Google OAuth metadata structure
			let first_name = user.user_metadata?.first_name || user.user_metadata?.given_name || '';
			let last_name = user.user_metadata?.last_name || user.user_metadata?.family_name || '';

			// If first_name/last_name not provided, try parsing full name
			if (!first_name && !last_name) {
				const fullName = user.user_metadata?.name || user.user_metadata?.full_name || '';
				if (fullName) {
					const nameParts = fullName.trim().split(' ');
					first_name = nameParts[0] || '';
					last_name = nameParts.slice(1).join(' ') || '';
				}
			}

			const userData = {
				auth_id: user.id,
				email: user.email,
				first_name,
				last_name,
				phone_number: user.user_metadata?.phone_number || null,
			};

			try {
				customUser = await saveUser(userData);
			} catch (saveError) {
				console.error('Failed to save user, but continuing with OAuth user data:', saveError);
				// Create a temporary user object from OAuth data
				customUser = {
					id: user.id, // Use auth_id as temporary id
					auth_id: user.id,
					email: user.email,
					first_name: userData.first_name,
					last_name: userData.last_name,
					phone_number: userData.phone_number,
				};
			}
		}

		// No backend-minted JWT — the caller already holds a real Supabase
		// session token (that's what authenticated this request); this route's
		// job is purely to ensure a public.users row exists for it, matching
		// the live frontend's actual use (AuthContext.tsx calls this on every
		// login/signup, but has never read `data.token` from the response).
		res.status(200).json({
			status: HTTP_STATUS.OK,
			message: "User synced successfully",
			data: {
				id: customUser.id,
				first_name: customUser.first_name,
				last_name: customUser.last_name,
				email: customUser.email,
				phone_number: customUser.phone_number,
			},
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
			message: MESSAGES.SERVER_ERROR,
		});
	}
};

// Get user profile endpoint
const getUserProfile = async (req, res) => {
	try {
		// Get user from JWT token
		const userId = req.user?.userId;

		if (!userId) {
			return res.status(401).json({
				status: HTTP_STATUS.UNAUTHORIZED,
				message: "User not authenticated",
			});
		}

		// Fetch user data from database
		const { data: user, error } = await getUserProfileById(userId);

		if (error || !user) {
			console.error('Error fetching user profile:', error);
			return res.status(404).json({
				status: HTTP_STATUS.NOT_FOUND,
				message: "User profile not found",
			});
		}

		res.status(HTTP_STATUS.OK).json({
			status: HTTP_STATUS.OK,
			message: "User profile retrieved successfully",
			data: {
				id: user.id,
				email: user.email,
				first_name: user.first_name,
				last_name: user.last_name,
				phone_number: user.phone_number,
				created_at: user.created_at,
			},
		});
	} catch (error) {
		console.error('Get user profile error:', error);
		res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
			status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
			message: MESSAGES.SERVER_ERROR,
		});
	}
};

// Update user profile
const updateUserProfile = async (req, res) => {
	try {
		const userId = req.user.userId || req.user.id; // Use userId from custom users table
		const authId = req.user.authId; // Get the auth ID from the authenticated user
		const { first_name, last_name, phone_number } = req.body;

		console.log('Update profile request:', { userId, authId, first_name, last_name, phone_number });

		// Validate that at least first_name and last_name are provided
		if (!first_name || !last_name) {
			return res.status(400).json({
				status: HTTP_STATUS.BAD_REQUEST,
				message: "First name and last name are required",
			});
		}

		// Build update object
		const updateData: { first_name: string; last_name: string; phone_number?: string } = {
			first_name: first_name.trim(),
			last_name: last_name.trim(),
		};

		// Add phone_number if provided
		if (phone_number && phone_number.trim()) {
			updateData.phone_number = phone_number.trim();
		}

		// Update user in Supabase users table
		const { data: user, error: updateError } = await updateUserProfileById(userId, updateData);

		if (updateError || !user) {
			console.error('Error updating user profile in table:', updateError);
			return res.status(400).json({
				status: HTTP_STATUS.BAD_REQUEST,
				message: "Failed to update user profile",
				error: updateError?.message,
			});
		}

		console.log('User profile updated successfully in table:', user);

		res.status(HTTP_STATUS.OK).json({
			status: HTTP_STATUS.OK,
			message: "User profile updated successfully",
			data: {
				id: user.id,
				email: user.email,
				first_name: user.first_name,
				last_name: user.last_name,
				phone_number: user.phone_number,
			},
		});
	} catch (error) {
		console.error('Update user profile error:', error);
		res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
			status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
			message: MESSAGES.SERVER_ERROR,
			error: error.message,
		});
	}
};

/**
 * Logout controller — real, server-side Supabase session revocation.
 *
 * Phase 12: replaces the old in-memory/disk token-blacklist (which only
 * ever mattered for backend-minted JWTs, now removed entirely) and fixes a
 * real bug found while auditing this path: the previous implementation
 * called `userClientFromToken(token).auth.signOut()`, but that client is
 * built with `persistSession: false` and never has `setSession()` called
 * on it, so Supabase's own `signOut()` resolves an empty internal session
 * and never actually reaches the revocation endpoint — it was a silent
 * no-op. This calls `admin.signOut(token, 'global')` on the service-role
 * client instead, which takes the token directly (no session-object
 * requirement) and genuinely revokes it — and every other session the
 * user has open, matching `AuthContext.tsx`'s own client-side signOut
 * call, which already worked correctly for the same reason (real
 * persisted browser session, not a headless one).
 */
const logout = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(400).json({
                status: HTTP_STATUS.BAD_REQUEST,
                message: "No token provided",
            });
        }

        const { error } = await supabase.auth.admin.signOut(token, "global");
        if (error) {
            // Best-effort: the client already clears its own local session
            // regardless of this call's outcome (AuthContext.logout()), so a
            // failure here just means the server-side revocation didn't take
            // — log it, don't fail the logout response over it.
            console.warn('[Logout] Supabase admin signOut failed:', error.message);
        }

        return res.status(HTTP_STATUS.OK).json({
            status: HTTP_STATUS.OK,
            message: "Logged out successfully",
        });
    } catch (error) {
        console.error('[Logout] Error:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            message: MESSAGES.SERVER_ERROR,
        });
    }
};

export { signup, login, logout, syncUser, getUserProfile, updateUserProfile };
