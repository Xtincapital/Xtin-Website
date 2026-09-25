import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { useAuth } from "../../../contexts/AuthContext";

const SignupPage = () => {
	const navigate = useNavigate();
	const { signup, signInWithGoogle } = useAuth();
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		confirmPassword: "",
		phone: "",
		agreeToTerms: false,
		newsletter: false,
	});
	const [isLoading, setIsLoading] = useState(false);
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [showVerifyModal, setShowVerifyModal] = useState(false);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value
		}));
	};

	const validatePassword = (password) => {
		const errors = [];
		if (password.length < 8) {
			errors.push("at least 8 characters");
		}
		if (!/[a-z]/.test(password)) {
			errors.push("a lowercase letter");
		}
		if (!/[A-Z]/.test(password)) {
			errors.push("an uppercase letter");
		}
		if (!/[0-9]/.test(password)) {
			errors.push("a number");
		}
		if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
			errors.push("a special character");
		}
		return errors;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");
		setSuccess("");

		// Validate passwords match
		if (formData.password !== formData.confirmPassword) {
			setError("Passwords do not match");
			setIsLoading(false);
			return;
		}

		// Validate password strength
		const passwordErrors = validatePassword(formData.password);
		if (passwordErrors.length > 0) {
			setError(`Password must include ${passwordErrors.join(", ")}.`);
			setIsLoading(false);
			return;
		}

		// Validate terms agreement
		if (!formData.agreeToTerms) {
			setError("Please agree to the Terms of Service and Privacy Policy");
			setIsLoading(false);
			return;
		}

		try {
			const result = await signup(formData.email, formData.password, {
				firstName: formData.firstName,
				lastName: formData.lastName,
				phone: formData.phone,
			});

			// Signup successful
			setSuccess(result.message || "Account created successfully! Welcome to your dashboard.");

			// Clear form
			setFormData({
				firstName: "",
				lastName: "",
				email: "",
				password: "",
				confirmPassword: "",
				phone: "",
				agreeToTerms: false,
				newsletter: false,
			});

			if (result.requires_confirmation) {
				setShowVerifyModal(true);
			} else {
				// Redirect to dashboard after 3 seconds
				setTimeout(() => {
					navigate('/dashboard');
				}, 3000);
			}

		} catch (error) {
			setError(error.message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoogleSignIn = async () => {
		setIsGoogleLoading(true);
		setError("");

		try {
			await signInWithGoogle();
			// Supabase will handle the redirect to /dashboard after OAuth
		} catch (error) {
			setError(error.message);
			setIsGoogleLoading(false);
		}
	};



	return (
		<div className="bg-white text-gray-900 min-h-screen">
			<Navbar />

			{/* Main Content */}
			<section className="relative bg-gradient-to-br from-gray-50 to-white py-20 px-6 md:px-12 lg:px-24 mt-16">
				<div className="max-w-lg mx-auto">
					{/* Header */}
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold text-gray-900 mb-2">
							Create Your Account
						</h1>
						<p className="text-gray-600">
							Join Xtin Capital and start your investment journey
						</p>
					</div>

					{/* Signup Form */}
					<div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
						{/* Error Message */}
						{error && (
							<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
								<p className="text-red-600 text-sm">{error}</p>
							</div>
						)}

						{/* Success Message */}
						{success && (
							<div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
								<p className="text-green-600 text-sm">{success}</p>
							</div>
						)}

						<form onSubmit={handleSubmit} className="space-y-6">
							{/* Name Fields */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
										First Name
									</label>
									<input
										type="text"
										id="firstName"
										name="firstName"
										value={formData.firstName}
										onChange={handleChange}
										required
										className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
										placeholder="First name"
									/>
								</div>
								<div>
									<label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
										Last Name
									</label>
									<input
										type="text"
										id="lastName"
										name="lastName"
										value={formData.lastName}
										onChange={handleChange}
										required
										className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
										placeholder="Last name"
									/>
								</div>
							</div>

							{/* Email Field */}
							<div>
								<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
									Email Address
								</label>
								<input
									type="email"
									id="email"
									name="email"
									value={formData.email}
									onChange={handleChange}
									required
									className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
									placeholder="Enter your email"
								/>
							</div>

							{/* Phone Field */}
							<div>
								<label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
									Phone Number (Optional)
								</label>
								<input
									type="tel"
									id="phone"
									name="phone"
									value={formData.phone}
									onChange={handleChange}
									className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
									placeholder="Enter your phone number"
								/>
								<p className="text-xs text-gray-500 mt-1">
									Enter 10-digit phone number (cannot start with 0)
								</p>
							</div>

							{/* Password Fields */}
							<div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
											Password
										</label>
										<div className="relative">
											<input
												type={showPassword ? "text" : "password"}
												id="password"
												name="password"
												value={formData.password}
												onChange={handleChange}
												required
												className="w-full px-4 py-3 pr-10 bg-gray-50 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
												placeholder="Create a password"
											/>
											<button
												type="button"
												onClick={() => setShowPassword(!showPassword)}
												aria-label={showPassword ? "Hide password" : "Show password"}
												className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
											>
												{showPassword ? (
													<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
													</svg>
												) : (
													<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
													</svg>
												)}
											</button>
										</div>
									</div>
									<div>
										<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
											Confirm Password
										</label>
										<div className="relative">
											<input
												type={showConfirmPassword ? "text" : "password"}
												id="confirmPassword"
												name="confirmPassword"
												value={formData.confirmPassword}
												onChange={handleChange}
												required
												className="w-full px-4 py-3 pr-10 bg-gray-50 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
												placeholder="Re-enter password"
											/>
											<button
												type="button"
												onClick={() => setShowConfirmPassword(!showConfirmPassword)}
												aria-label={showConfirmPassword ? "Hide password" : "Show password"}
												className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
											>
												{showConfirmPassword ? (
													<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
													</svg>
												) : (
													<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
													</svg>
												)}
											</button>
										</div>
									</div>
								</div>
								<p className="text-xs text-gray-500 mt-2">
									Must be 8+ characters with uppercase, lowercase, number, and special character
								</p>
							</div>

							{/* Checkboxes */}
							<div className="space-y-4">
								<label className="flex items-start">
									<input
										type="checkbox"
										name="agreeToTerms"
										checked={formData.agreeToTerms}
										onChange={handleChange}
										required
										className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
									/>
									<span className="ml-2 text-sm text-gray-600">
										I agree to the{" "}
										<Link to="/terms" className="text-green-600 hover:text-green-700 font-medium">
											Terms of Service
										</Link>{" "}
										and{" "}
										<Link to="/privacy" className="text-green-600 hover:text-green-700 font-medium">
											Privacy Policy
										</Link>
									</span>
								</label>
								<label className="flex items-start">
									<input
										type="checkbox"
										name="newsletter"
										checked={formData.newsletter}
										onChange={handleChange}
										className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
									/>
									<span className="ml-2 text-sm text-gray-600">
										I want to receive updates about new features and investment opportunities
									</span>
								</label>
							</div>

							{/* Submit Button */}
							<button
								type="submit"
								disabled={isLoading}
								className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isLoading ? (
									<div className="flex items-center justify-center">
										<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
										</svg>
										Creating Account...
									</div>
								) : (
									'Create Account'
								)}
							</button>
						</form>

						{/* Divider */}
						<div className="my-6 flex items-center">
							<div className="flex-1 border-t border-gray-300"></div>
							<span className="px-4 text-sm text-gray-500">or</span>
							<div className="flex-1 border-t border-gray-300"></div>
						</div>

						{/* Social Signup */}
						<div className="space-y-3">
							<button
								type="button"
								onClick={handleGoogleSignIn}
								disabled={isGoogleLoading}
								className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isGoogleLoading ? (
									<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
								) : (
									<svg className="w-5 h-5" viewBox="0 0 24 24">
										<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
										<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
										<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
										<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
									</svg>
								)}
								{isGoogleLoading ? 'Signing up with Google...' : 'Sign up with Google'}
							</button>
						</div>

						{/* Login Link */}
						<div className="mt-6 text-center">
							<p className="text-gray-600">
								Already have an account?{" "}
								<Link to="/login" className="text-green-600 hover:text-green-700 font-medium">
									Sign in
								</Link>
							</p>
						</div>
					</div>
				</div>
			</section>

			<Footer />

			{/* Email Verification Modal */}
			{showVerifyModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-8 max-w-md mx-4">
						<h2 className="text-xl font-bold text-gray-900 mb-4">Verify Your Email</h2>
						<p className="text-gray-600 mb-6">
							Please check your email inbox and verify your account by clicking the link we sent you.
						</p>
						<button
							onClick={() => {
								setShowVerifyModal(false);
								navigate('/login');
							}}
							className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition duration-200"
						>
							OK
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default SignupPage; 