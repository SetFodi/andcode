"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function VerificationPending() {
  const { user } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const handleResendVerification = async () => {
    if (!user || !user.email) {
      setError("You need to be logged in to resend verification");
      return;
    }
    
    setIsResending(true);
    setError("");
    setResendSuccess(false);
    
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to resend verification email");
      } else {
        setResendSuccess(true);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Error resending verification:", err);
    } finally {
      setIsResending(false);
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-500 to-violet-500 px-6 py-8 text-center">
            <h2 className="text-2xl font-bold text-white">
              Email Verification Required
            </h2>
            <p className="mt-2 text-sm text-blue-100">
              Please verify your email address to continue
            </p>
          </div>

          <div className="px-6 py-8">
            <div className="text-center">
              <div className="flex justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                Check Your Email
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                We've sent a verification link to <span className="font-medium">{user?.email || "your email address"}</span>. 
                Please check your inbox and click the link to verify your account.
              </p>
              
              {error && (
                <div className="mb-6 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm text-red-700 dark:text-red-400">{error}</div>
                  </div>
                </div>
              )}
              
              {resendSuccess && (
                <div className="mb-6 rounded-md bg-green-50 dark:bg-green-900/20 p-4">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-green-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm text-green-700 dark:text-green-400">
                      Verification email sent! Please check your inbox.
                    </div>
                  </div>
                </div>
              )}
              
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Didn't receive the email? Check your spam folder or click below to resend.
              </p>
              
              <button
                onClick={handleResendVerification}
                disabled={isResending}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Resending...
                  </span>
                ) : "Resend Verification Email"}
              </button>
              
              <div className="mt-8">
                <Link 
                  href="/auth/signin" 
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}