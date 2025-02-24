'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Redirect to problems if logged in and not in loading state
    if (user && !loading) {
      router.push("/problems");
    }
  }, [user, loading, router]);

  // If still loading auth state, show a loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Sharpen Your Coding Skills
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Practice with hundreds of coding challenges, prepare for technical interviews, 
          and track your progress in our community of developers.
        </p>
        
        {user ? (
          <div className="space-y-4">
            <Link 
              href="/problems"
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-lg"
            >
              Start Solving
            </Link>
            
            <p className="text-gray-500 mt-2">
              Welcome back, {user.username}!
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition font-medium text-lg"
              >
                Join Now
              </Link>
              <Link
                href="/auth/signin"
                className="px-8 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition font-medium text-lg"
              >
                Sign In
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="p-6 bg-white rounded-lg shadow-md">
                <div className="text-3xl mb-3">🧩</div>
                <h3 className="text-xl font-semibold mb-2">350+ Problems</h3>
                <p className="text-gray-600">From easy to hard, covering algorithms, data structures, and more.</p>
              </div>
              
              <div className="p-6 bg-white rounded-lg shadow-md">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
                <p className="text-gray-600">Monitor your improvement with detailed statistics and insights.</p>
              </div>
              
              <div className="p-6 bg-white rounded-lg shadow-md">
                <div className="text-3xl mb-3">🏆</div>
                <h3 className="text-xl font-semibold mb-2">Weekly Contests</h3>
                <p className="text-gray-600">Test your skills against other developers in timed challenges.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}