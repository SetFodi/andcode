// app/profile/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth(); // Ensure you have useAuth that manages the user state
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  useEffect(() => {
    if (!loading && !redirectAttempted) {
      setRedirectAttempted(true);
      
      if (user) {
        const userId = user._id || user.userId;
        if (userId) {
          router.push(`/profile/${userId}`);
        } else {
          router.push('/auth/signin');
        }
      } else {
        router.push('/auth/signin');
      }
    }
  }, [user, loading, router, redirectAttempted]);

  if (loading || redirectAttempted) {
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

  return null; // Do not render anything here, redirection will happen if user is found
}
