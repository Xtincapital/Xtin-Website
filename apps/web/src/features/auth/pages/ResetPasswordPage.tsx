import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { Lock } from "lucide-react";
import { PageBackdrop, AuthHero } from "../../marketing/components/PageArt";
import supabase from "../../../supabase";

const ResetPasswordPage = () => {
	const navigate = useNavigate();
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [isValidSession, setIsValidSession] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	useEffect(() => {
		// Check if user has a valid session from the reset link
		const checkSession = async () => {
			const { data: { session }, error } = await supabase.auth.getSession();
			if (session && !error) {
				setIsValidSession(true);
			} else {
				setError("Invalid or expired reset link. Please request a new password reset.");
			}
		};

		checkSession();
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");
		setSuccess("");

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			setIsLoading(false);
			return;
		}

		if (password.length < 8) {
			setError("Password must be at least 8 characters long");
			setIsLoading(false);
			return;
		}

		try {
			const { error } = await supabase.auth.updateUser({
				password: password
			});

			if (error) {
				throw error;
			}

			setSuccess("Password updated successfully! Redirecting to login...");

			// Redirect to login after success
			setTimeout(() => {
				navigate('/login');
			}, 2000);
		} catch (error) {
			setError(error.message);
		} finally {
			setIsLoading(false);
		}
	};

	if (!isValidSession && !error) {
		return (
			<div className="bg-white text-gray-900 min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
					<p className="mt-4 text-gray-600">Verifying reset link...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white text-gray-900 min-h-screen">
			<Navbar />

			{/* Main Content */}
			<section className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white py-20 px-6 md:px-12 lg:px-24 mt-16">
				<PageBackdrop />
				<div className="relative max-w-md mx-auto">
					{/* Header */}
					<div className="text-center mb-8">
						<AuthHero variant="reset" />
						<h1 className="text-3xl md:text-4xl font-display font-semibold text-gray-900 mb-2 tracking-[-0.025em]">
							Reset Your Password
						</h1>
						<p className="text-gray-600">
							Enter your new password below.
						</p>
					</div>

					{/* Form */}
					<div className="bg-white rounded-2xl shadow-xl shadow-brand/5 border border-gray-200 border-t-4 border-t-brand-fill p-8">
						{/* Error Message */}
						{error && (
							<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
								<p className="text-red-600 text-sm">{error}</p>
							</div>
						)}

						{/* Success Message */}
						{success && (
							<div className="mb-6 p-4 bg-brand-soft border border-brand-line rounded-lg">
								<p className="text-brand text-sm">{success}</p>
							</div>
						)}

						{isValidSession && !success && (
							<form onSubmit={handleSubmit} className="space-y-6">
								{/* New Password Field */}
								<div className="relative">
									<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
										New Password
									</label>
									<div className="relative">
										<Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />
										<input
											type={showPassword ? "text" : "password"}
											id="password"
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											required
											className="w-full pl-11 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-brand/15 focus:border-brand-fill transition duration-200"
											placeholder="Enter new password"
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
									</div>
									<p className="text-xs text-gray-500 mt-1">
										Must be at least 8 characters
									</p>
								</div>

								{/* Confirm Password Field */}
								<div className="relative">
									<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
										Confirm New Password
									</label>
									<div className="relative">
										<Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />
										<input
											type={showConfirmPassword ? "text" : "password"}
											id="confirmPassword"
											value={confirmPassword}
											onChange={(e) => setConfirmPassword(e.target.value)}
											required
											className="w-full pl-11 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-brand/15 focus:border-brand-fill transition duration-200"
											placeholder="Confirm new password"
										/>
										<button
											type="button"
											onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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

								{/* Submit Button */}
								<button
									type="submit"
									disabled={isLoading}
									className="w-full bg-brand-fill text-white py-3 px-4 rounded-lg font-semibold hover:bg-brand-hover focus:ring-2 focus:ring-brand focus:ring-offset-2 shadow-lg shadow-brand/20 hover:-translate-y-0.5 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isLoading ? (
										<div className="flex items-center justify-center">
											<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
												<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
												<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
											</svg>
											Updating...
										</div>
									) : (
										'Update Password'
									)}
								</button>
							</form>
						)}
					</div>
				</div>
			</section>

			<Footer />
		</div>
	);
};

export default ResetPasswordPage;