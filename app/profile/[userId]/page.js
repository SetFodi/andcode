// app/profile/[userId]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import UserProfile from '@/components/UserProfile';

export default function UserProfilePage() {
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userExists, setUserExists] = useState(false);
  const [userData, setUserData] = useState(null);  // To store the user data
  const [submissions, setSubmissions] = useState([]);  // To store the submissions data
  const [statistics, setStatistics] = useState({});  // To store the statistics data
  const userId = params?.userId;

  useEffect(() => {
    async function fetchUserData() {
      if (!userId) {
        setError("User ID is missing");
        setIsLoading(false);
        return;
      }

      try {
        const userResponse = await fetch(`/api/users/${userId}`);
        const userData = await userResponse.json();
        setUserData(userData);
        
        if (!userData) {
          setError("User not found");
          setUserExists(false);
          return;
        }

        const submissionsResponse = await fetch(`/api/users/${userId}/submissions?limit=10`);
        const submissionsData = await submissionsResponse.json();
        setSubmissions(submissionsData);

        const statisticsResponse = await fetch(`/api/users/${userId}/statistics`);
        const statisticsData = await statisticsResponse.json();
        setStatistics(statisticsData);

        setUserExists(true);
        setIsLoading(false);
      } catch (err) {
        setError("Error connecting to the server");
        setUserExists(false);
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
      {userExists && (
        <div>
          <UserProfile userId={userId} userData={userData} submissions={submissions} statistics={statistics} />
        </div>
      )}
    </div>
  );
}
