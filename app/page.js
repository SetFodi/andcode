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
    <main className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-10">
      <div className="max-w-4xl w-full text-center">
        {/* Headline with dark/light mode compatible gradient */}
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
          Sharpen Your Coding Skills
        </h1>
       
        {/* Subtitle with dark/light mode compatible text */}
        <p className="text-xl dark:text-gray-300 text-gray-700 mb-10 max-w-2xl mx-auto">
          Practice with hundreds of coding challenges, prepare for technical interviews,
          and track your progress in our community of developers.
        </p>
       
        {user ? (
          <div className="space-y-4">
            <Link
              href="/problems"
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium text-lg shadow-md hover:shadow-lg"
            >
              Start Solving
            </Link>
           
            <p className="dark:text-gray-400 text-gray-600 mt-3">
              Welcome back, {user.username}!
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-violet-500 text-white rounded-lg hover:opacity-90 transition-all duration-300 font-medium text-lg shadow-md hover:shadow-lg"
              >
                Join Now
              </Link>
              <Link
                href="/auth/signin"
                className="px-8 py-3 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-lg transition-all duration-300 font-medium text-lg"
              >
                Sign In
              </Link>
            </div>
           
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature cards with dark/light mode compatibility */}
              <div className="p-6 dark:bg-gray-800 bg-white rounded-lg shadow-md border dark:border-gray-700 border-gray-200 transition-all duration-300 hover:shadow-lg">
                <div className="text-3xl mb-3">🧩</div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">350+ Problems</h3>
                <p className="dark:text-gray-300 text-gray-600">From easy to hard, covering algorithms, data structures, and more.</p>
              </div>
             
              <div className="p-6 dark:bg-gray-800 bg-white rounded-lg shadow-md border dark:border-gray-700 border-gray-200 transition-all duration-300 hover:shadow-lg">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">Track Progress</h3>
                <p className="dark:text-gray-300 text-gray-600">Monitor your improvement with detailed statistics and insights.</p>
              </div>
             
              <div className="p-6 dark:bg-gray-800 bg-white rounded-lg shadow-md border dark:border-gray-700 border-gray-200 transition-all duration-300 hover:shadow-lg">
                <div className="text-3xl mb-3">🏆</div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">Weekly Contests</h3>
                <p className="dark:text-gray-300 text-gray-600">Test your skills against other developers in timed challenges.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}