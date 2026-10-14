import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { useAuth } from "../../../contexts/AuthContext";

const LoginPage = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { login, signInWithGoogle } = useAuth();
	
	// Get the return URL from location state (set by ProtectedRoute) or default to dashboard
	const from = location.state?.from?.pathname || '/dashboard';
	
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		rememberMe: false,
		agreeToTerms: false,
	});
	const [isLoading, setIsLoading] = useState(false);
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);
	const [error, setError] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value
		}));
	};

	const handleGoogleSignIn = async () => {
		setIsGoogleLoading(true);
		setError("");

		try {
			// Store returnUrl in sessionStorage for Google OAuth redirect
			if (from !== '/dashboard') {
				sessionStorage.setItem('returnUrl', from);
			}
			await signInWithGoogle();
			// Supabase will handle the redirect after OAuth
		} catch (error) {
			setError(error.message);
			setIsGoogleLoading(false);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		// Validate terms agreement
		if (!formData.agreeToTerms) {
			setError("Please agree to the Terms of Service and Privacy Policy");
			setIsLoading(false);
			return;
		}

		try {
			await login(formData.email, formData.password, formData.rememberMe);

			// Login successful
			// Redirect to the original destination or dashboard
			navigate(from, { replace: true });
		} catch (error) {
			setError(error.message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="bg-white text-gray-900 min-h-screen">
			<Navbar />

			{/* Main Content */}
			<section className="relative bg-gradient-to-br from-gray-50 to-white py-20 px-6 md:px-12 lg:px-24 mt-16">
				<div className="max-w-md mx-auto">
					{/* Header */}
					<div className="text-center mb-8">
						<h1 className="text-3xl font-display font-normal text-gray-900 mb-2 tracking-[-0.015em]">
							Welcome Back
						</h1>
						<p className="text-gray-600">
							Sign in to your Xtin Capital account
						</p>
					</div>

					{/* Login Form */}
					<div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
						{/* Error Message */}
						{error && (
							<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
								<p className="text-red-600 text-sm">{error}</p>
							</div>
						)}

						<form onSubmit={handleSubmit} className="space-y-6">
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
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
									placeholder="Enter your email"
								/>
							</div>

							{/* Password Field */}
							<div className="relative">
								<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
									Password
								</label>
								<input
									type={showPassword ? "text" : "password"}
									id="password"
									name="password"
									value={formData.password}
									onChange={handleChange}
									required
									className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
									placeholder="Enter your password"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
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
								<p className="text-xs text-gray-500 mt-1">
									Password must be at least 8 characters with uppercase, lowercase, number, and special character
								</p>
							</div>

							{/* Remember Me & Forgot Password */}
							<div className="flex items-center justify-between">
								<label className="flex items-center">
									<input
										type="checkbox"
										name="rememberMe"
										checked={formData.rememberMe}
										onChange={handleChange}
										className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
									/>
									<span className="ml-2 text-sm text-gray-600">Remember me</span>
								</label>
								<Link to="/forgot-password" className="text-sm text-green-600 hover:text-green-700 font-medium">
									Forgot password?
								</Link>
							</div>

							{/* Terms & Conditions Checkbox */}
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
										Signing In...
									</div>
								) : (
									'Sign In'
								)}
							</button>
						</form>

						{/* Divider */}
						<div className="my-6 flex items-center">
							<div className="flex-1 border-t border-gray-300"></div>
							<span className="px-4 text-sm text-gray-500">or</span>
							<div className="flex-1 border-t border-gray-300"></div>
						</div>

						{/* Social Login */}
						<div className="space-y-3">
							<button
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
										<path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
										<path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
										<path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
										<path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
									</svg>
								)}
								{isGoogleLoading ? 'Signing in with Google...' : 'Continue with Google'}
							</button>
						</div>

						{/* Sign Up Link */}
						<div className="mt-6 text-center">
							<p className="text-gray-600">
								Don't have an account?{" "}
								<Link to="/signup" className="text-green-600 hover:text-green-700 font-medium">
									Sign up
								</Link>
							</p>
						</div>
					</div>
				</div>
			</section>

			<Footer />
		</div>
	);
};

export default LoginPage; 