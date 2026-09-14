/*
Forgot Password Flow Steps:
1. User clicks "Forgot password?" link from login page
2. User is navigated to /forgot-password page
3. User enters their email address
4. On submit, authService.forgotPassword() is called, which uses Supabase's resetPasswordForEmail()
5. Supabase sends a password reset email to the user with a reset link
6. User clicks the link in email, which redirects to /reset-password with access_token and refresh_token in URL
7. The reset password page (not implemented yet) would allow user to enter new password
8. After successful reset, user can login with new password
*/
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import authService from "../../../services/authService";

const ForgotPasswordPage = () => {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");
		setSuccess("");

		try {
			await authService.forgotPassword(email);
			setSuccess("Password reset email sent! Please check your inbox.");
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
						<h1 className="text-3xl font-bold text-gray-900 mb-2">
							Reset Your Password
						</h1>
						<p className="text-gray-600">
							Enter your email address and we'll send you a link to reset your password.
						</p>
					</div>

					{/* Form */}
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
							{/* Email Field */}
							<div>
								<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
									Email Address
								</label>
								<input
									type="email"
									id="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
									placeholder="Enter your email"
								/>
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
										Sending...
									</div>
								) : (
									'Send Reset Email'
								)}
							</button>
						</form>

						{/* Back to Login */}
						<div className="mt-6 text-center">
							<p className="text-gray-600">
								Remember your password?{" "}
								<Link to="/login" className="text-green-600 hover:text-green-700 font-medium">
									Sign in
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

export default ForgotPasswordPage;