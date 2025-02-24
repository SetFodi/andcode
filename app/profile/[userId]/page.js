"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import UserProfile from "@/components/UserProfile";

export default function UserProfilePage() {
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [statistics, setStatistics] = useState({
    totalSolved: 0,
    successRate: 0,
    ranking: 0,
    difficultyBreakdown: { easy: 0, medium: 0, hard: 0 },
  });
  const userId = params?.userId;

  useEffect(() => {
    async function fetchUserData() {
      if (!userId || typeof userId !== "string" || userId.length !== 24) {
        setError("Invalid or missing User ID");
        setIsLoading(false);
        return;
      }
    
      try {
        // Fetch user data
        const userResponse = await fetch(`/api/users/${userId}`, {
          credentials: "include",
        });
        if (!userResponse.ok) {
          const errorText = await userResponse.text();
          throw new Error(`Failed to fetch user: ${userResponse.status} - ${errorText}`);
        }
        let userData;
        try {
          userData = await userResponse.json();
        } catch (jsonError) {
          const responseText = await userResponse.text();
          console.error("Failed to parse user data JSON:", jsonError, "Raw response:", responseText);
          throw new Error(`Invalid response from server: ${jsonError.message}`);
        }
        console.log("Fetched user data:", userData);
        if (!userData || typeof userData !== "object" || !userData._id) {
          console.error("User data validation failed:", userData);
          throw new Error("Invalid user data received: missing or malformed user object");
        }
        setUserData(userData);
    
        // Fetch submissions
        let submissionsResponse;
        try {
          submissionsResponse = await fetch(`/api/users/${userId}/submissions?limit=10`, {
            credentials: "include",
          });
        } catch (fetchError) {
          console.error("Network error fetching submissions:", fetchError);
          throw new Error(`Network error fetching submissions: ${fetchError.message}`);
        }
        // ... (rest of the function unchanged)
        if (!submissionsResponse.ok) {
          const errorText = await submissionsResponse.text();
          throw new Error(`Failed to fetch submissions: ${submissionsResponse.status} - ${errorText}`);
        }
        let submissionsData;
        try {
          submissionsData = await submissionsResponse.json();
        } catch (jsonError) {
          const responseText = await submissionsResponse.text();
          console.error("Failed to parse submissions data JSON:", jsonError, "Response text:", responseText);
          throw new Error(`Invalid submissions response: ${jsonError.message}`);
        }
        console.log("Fetched submissions data:", submissionsData);
        const submissionsArray = Array.isArray(submissionsData.submissions) ? submissionsData.submissions : [];
        setSubmissions(submissionsArray);

        // Fetch statistics
        const statisticsResponse = await fetch(`/api/users/${userId}/statistics`, {
          credentials: "include",
        });
        if (!statisticsResponse.ok) {
          const errorText = await statisticsResponse.text();
          throw new Error(`Failed to fetch statistics: ${statisticsResponse.status} - ${errorText}`);
        }
        let statisticsData;
        try {
          statisticsData = await statisticsResponse.json();
        } catch (jsonError) {
          const responseText = await statisticsResponse.text();
          console.error("Failed to parse statistics data JSON:", jsonError, "Response text:", responseText);
          throw new Error(`Invalid statistics response: ${jsonError.message}`);
        }
        console.log("Fetched statistics data:", statisticsData);
        setStatistics(statisticsData);

        setIsLoading(false);
      } catch (err) {
        console.error("Error in fetchUserData:", err);
        setError(`Error loading profile: ${err.message}`);
        setSubmissions([]);
        setStatistics({
          totalSolved: 0,
          successRate: 0,
          ranking: 0,
          difficultyBreakdown: { easy: 0, medium: 0, hard: 0 },
        });
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center bg-gray-100 dark:bg-gray-900">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-red-700 dark:text-red-400 mb-2">{error}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 bg-gray-100 dark:bg-gray-900">
      <UserProfile
        userId={userId}
        userData={userData}
        submissions={submissions}
        statistics={statistics}
      />
    </div>
  );
}