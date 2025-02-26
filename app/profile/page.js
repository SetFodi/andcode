"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/hooks/useAuth";
import { RefreshCw, User } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const [redirectProgress, setRedirectProgress] = useState(0);
  const [redirectMessage, setRedirectMessage] = useState("Checking authentication...");
  
  useEffect(() => {
    let progressInterval;
    
    if (!loading) {
      // Start progress animation
      progressInterval = setInterval(() => {
        setRedirectProgress(prev => {
          const newProgress = prev + 5;
          if (newProgress >= 100) {
            clearInterval(progressInterval);
          }
          return Math.min(newProgress, 100);
        });
      }, 50);
      
      if (user) {
        console.log("ProfilePage: User found, redirecting to profile:", user);
        const userId = user._id;
        
        if (userId) {
          setRedirectMessage("Redirecting to your profile...");
          // Use a more direct approach to navigation
          window.location.href = `/profile/${userId}`;
        } else {
          console.error("ProfilePage: User object has no _id:", user);
          setRedirectMessage("User ID not found. Please try signing in again.");
        }
      } else {
        console.log("ProfilePage: No user found, redirecting to sign in");
        setRedirectMessage("Please sign in to view your profile");
        router.push('/auth/signin');
      }
      
      setRedirectAttempted(true);
    }
    
    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        <div className="mb-6 relative">
          <div className="w-24 h-24 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            {loading ? (
              <RefreshCw className="w-12 h-12 text-blue-500 animate-spin" />
            ) : (
              <User className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            )}
          </div>
          
          {!loading && redirectProgress >= 75 && (
            <div className="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center">
              <div className="w-32 h-32 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
          {loading ? "Loading Profile" : "Finding Your Profile"}
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {redirectMessage}
        </p>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${redirectProgress}%` }}
          ></div>
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
          {redirectAttempted ? "Redirecting..." : "Preparing your dashboard..."}
        </div>
      </div>
    </div>
  );
}