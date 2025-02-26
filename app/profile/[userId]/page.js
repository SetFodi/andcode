// app/profile/[userId]/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import UserProfile from "@/components/UserProfile";
import { AlertCircle, RefreshCw } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [statistics, setStatistics] = useState({
    totalSolved: 0,
    successRate: 0,
    ranking: 0,
    difficultyBreakdown: { easy: 0, medium: 0, hard: 0 },
    activityGraph: []
  });
  const [loadingProgress, setLoadingProgress] = useState(10);
  const userId = params?.userId;

  // Add debug logging
  useEffect(() => {
    console.log("UserProfilePage mounted with userId:", userId);
    console.log("Current authenticated user:", user);
    console.log("Auth loading state:", authLoading);
  }, [userId, user, authLoading]);

  // Generate placeholder activity data if none exists
  useEffect(() => {
    if (statistics.activityGraph.length === 0) {
      const activityData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        activityData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          submissions: 0
        });
      }
      setStatistics(prev => ({
        ...prev,
        activityGraph: activityData
      }));
    }
  }, [statistics.activityGraph]);

  useEffect(() => {
    async function fetchUserData() {
      if (!userId || typeof userId !== "string") {
        setError("Invalid or missing User ID");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Fetching data for user:", userId);
        setLoadingProgress(30);
        
        // Fetch user data
        const userResponse = await fetch(`/api/users/${userId}`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        console.log("User data fetch response status:", userResponse.status);

        if (!userResponse.ok) {
          const errorData = await userResponse.json().catch(() => ({ error: "Unknown error" }));
          throw new Error(errorData.error || `Failed to fetch user: ${userResponse.status}`);
        }

        const userData = await userResponse.json();
        console.log("User data received:", userData);

        if (!userData || !userData.username) {
          throw new Error("Invalid user data received");
        }

        // Check if this is the current user
        if (user && user._id === userId) {
          userData.isCurrentUser = true;
        }

        setUserData(userData);
        setLoadingProgress(60);

        // Rest of your fetch logic for submissions and statistics
        // ...
      } catch (err) {
        console.error("Error in fetchUserData:", err);
        setError(`Error loading profile: ${err.message}`);
        setSubmissions([]);
        setStatistics(prev => ({
          ...prev,
          totalSolved: 0,
          successRate: 0,
          ranking: 0,
          difficultyBreakdown: { easy: 0, medium: 0, hard: 0 }
        }));
      } finally {
        setIsLoading(false);
      }
    }

    // Important: Changed this to check if we're done loading auth, regardless of user state
    if (!authLoading) {
      fetchUserData();
    }
  }, [userId, user, authLoading]);

  // Modified redirect logic - only redirect if explicitly not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.log("User not authenticated, redirecting to signin page");
      // Use direct navigation for better reliability with authentication redirects
      window.location.href = `/auth/signin?callbackUrl=/profile/${userId}`;
    }
  }, [authLoading, user, userId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8 text-center">
          <div className="relative w-20 h-20 mx-auto mb-6 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Loading Profile</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please wait while we load the user data...</p>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 flex-shrink-0 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Error Loading Profile</h2>
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
            
            <a 
              href="/problems"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Browse Problems
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <UserProfile
        userId={userId}
        userData={userData}
        submissions={submissions}
        statistics={statistics}
      />
    </div>
  );
}