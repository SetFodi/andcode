'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import UserProfile from '@/components/UserProfile';

export default function UserProfilePage() {
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userExists, setUserExists] = useState(false);
  
  // Get userId from route params
  const userId = params?.userId;

  useEffect(() => {
    async function checkUserExists() {
      if (!userId) {
        setError("User ID is missing");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // For now, we'll assume user exists since we don't have the exists endpoint yet
        // In a real implementation, you'd check with an API call
        setUserExists(true);
        setError(null);
        setIsLoading(false);
        
        /* When you have the API endpoint, uncomment this:
        const response = await fetch(`/api/users/${userId}/exists`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError("User not found");
          } else {
            setError("Error loading user profile");
          }
          setUserExists(false);
        } else {
          setUserExists(true);
          setError(null);
        }
        */
      } catch (err) {
        console.error("Error checking if user exists:", err);
        setError("Error connecting to server");
        setUserExists(false);
      } finally {
        // This is already called in the early return above
        // But we leave it here for when we uncomment the API call
        setIsLoading(false);
      }
    }

    checkUserExists();
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
          <h2 className="text-2xl font-semibold text-red-700 mb-2">
            {error}
          </h2>
          <p className="text-red-600">
            The user profile you're looking for couldn't be found or there was an error loading it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {userExists && <UserProfile userId={userId} />}
    </div>
  );
}