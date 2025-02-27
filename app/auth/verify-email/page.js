// app/auth/verify-email/page.js
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import VerificationPending from "@/components/VerificationPending";

export default function VerifyEmailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in, redirect to sign in
        router.push("/auth/signin");
      } else if (user && user.isVerified) {
        // Already verified, redirect to problems
        router.push("/problems");
      }
    }
  }, [user, loading, router]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect in useEffect
  }
  
  return <VerificationPending />;
}