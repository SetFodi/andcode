'use client'
import { useEffect } from "react";
import Cookies from 'js-cookie';  // Make sure you have js-cookie installed

export default function Home() {
  const isLoggedIn = Cookies.get('token');

  useEffect(() => {
    // Redirect to problems if logged in
    if (isLoggedIn) {
      window.location.href = "/problems";  // Redirect to the problems page
    }
  }, [isLoggedIn]);

  return (
    <div className="text-center">
      <h2 className="text-4xl font-bold mb-4">Welcome to My LeetCode App</h2>
      <p className="text-lg text-gray-600 mb-8">
        Practice coding challenges and improve your skills.
      </p>

      {isLoggedIn ? (
        <a
          href="/problems"
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Browse Problems
        </a>
      ) : (
        <div>
          <a
            href="/auth/signup"
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            Sign Up
          </a>
          <a
            href="/auth/signin"
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition ml-4"
          >
            Sign In
          </a>
        </div>
      )}
    </div>
  );
}
