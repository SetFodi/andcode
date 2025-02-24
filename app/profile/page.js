"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  useEffect(() => {
    if (!loading && !redirectAttempted) {
      setRedirectAttempted(true);
      
      if (user) {
        // Redirect to the user profile page
        router.push(`/profile/${user._id || user.userId}`);
      } else {
        // No user found, redirect to sign-in
        router.push('/auth/signin');
      }
    }
  }, [user, loading, router, redirectAttempted]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-500">Loading your profile...</p>
      <div className="mt-4 text-sm text-gray-400">
        {redirectAttempted ? "Redirecting..." : "Checking authentication..."}
      </div>
    </div>
  );
}
