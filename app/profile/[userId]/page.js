// app/profile/[userId]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import UserProfile from '@/components/UserProfile';

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
    difficultyBreakdown: { easy: 0, medium: 0, hard: 0 }
  });
  const userId = params?.userId;

  useEffect(() => {
    async function fetchUserData() {
      if (!userId) {
        setError("User ID is missing");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch user data
        const userResponse = await fetch(`/api/users/${userId}`, {
          credentials: 'include'
        });
        if (!userResponse.ok) {
          const errorText = await userResponse.text();
          throw new Error(`Failed to fetch user: ${errorText}`);
        }
        const userData = await userResponse.json();
        console.log("Fetched user data:", userData);
        setUserData(userData);

        // Fetch submissions
        const submissionsResponse = await fetch(`/api/users/${userId}/submissions?limit=10`, {
          credentials: 'include'
        });
        if (!submissionsResponse.ok) {
          const errorText = await submissionsResponse.text();
          console.error(`Failed to fetch submissions: ${errorText}`);
          throw new Error(`Failed to fetch submissions: ${submissionsResponse.status}`);
        }
        const submissionsData = await submissionsResponse.json();
        console.log("Fetched submissions data:", submissionsData);
        setSubmissions(submissionsData.submissions || submissionsData);

        // Fetch statistics
        const statisticsResponse = await fetch(`/api/users/${userId}/statistics`, {
          credentials: 'include'
        });
        if (!statisticsResponse.ok) {
          const errorText = await statisticsResponse.text();
          console.error(`Failed to fetch statistics: ${errorText}`);
          throw new Error(`Failed to fetch statistics: ${statisticsResponse.status}`);
        }
        const statisticsData = await statisticsResponse.json();
        console.log("Fetched statistics data:", statisticsData);
        setStatistics(statisticsData);

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError(err.message);
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="bg-red-50 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-red-700 mb-2">{error}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <UserProfile
        userId={userId}
        userData={userData}
        submissions={submissions}
        statistics={statistics}
      />
    </div>
  );
}