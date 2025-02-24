"use client";
import React, { useState, useEffect } from "react";

export default function UserProfile({ userId, userData, submissions, statistics }) {
  const [activeTab, setActiveTab] = useState("submissions");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      setIsLoading(false);
    }
  }, [userId]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculatePercentage = (value, total) => {
    if (!total) return 0;
    return (value / total) * 100;
  };

  const totalProblems =
    statistics.difficultyBreakdown.easy +
    statistics.difficultyBreakdown.medium +
    statistics.difficultyBreakdown.hard;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12 bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <p className="text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {userData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto mb-4 flex items-center justify-center">
                  {userData.avatarUrl ? (
                    <img
                      src={userData.avatarUrl}
                      alt={userData.username}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">👤</span>
                  )}
                </div>
                <h2 className="text-xl font-bold mb-2">{userData.username}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Joined {formatDate(userData.createdAt || new Date())}
                </p>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-600 dark:text-gray-400">Problems Solved</span>
                  <span className="font-bold">{statistics.totalSolved}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-600 dark:text-gray-400">Success Rate</span>
                  <span className="font-bold">{statistics.successRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Ranking</span>
                  <span className="font-bold">#{statistics.ranking || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Progress Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-6">
              <h3 className="font-bold mb-4">Difficulty Breakdown</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-green-500">Easy</span>
                    <span>{statistics.difficultyBreakdown.easy}</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded">
                    <div
                      className="h-full bg-green-500 rounded"
                      style={{ width: `${calculatePercentage(statistics.difficultyBreakdown.easy, totalProblems)}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-yellow-500">Medium</span>
                    <span>{statistics.difficultyBreakdown.medium}</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded">
                    <div
                      className="h-full bg-yellow-500 rounded"
                      style={{ width: `${calculatePercentage(statistics.difficultyBreakdown.medium, totalProblems)}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-red-500">Hard</span>
                    <span>{statistics.difficultyBreakdown.hard}</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded">
                    <div
                      className="h-full bg-red-500 rounded"
                      style={{ width: `${calculatePercentage(statistics.difficultyBreakdown.hard, totalProblems)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex">
                  <button
                    className={`px-6 py-3 text-sm font-medium ${
                      activeTab === "submissions"
                        ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                    onClick={() => setActiveTab("submissions")}
                  >
                    Submissions
                  </button>
                  <button
                    className={`px-6 py-3 text-sm font-medium ${
                      activeTab === "statistics"
                        ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                    onClick={() => setActiveTab("statistics")}
                  >
                    Statistics
                  </button>
                </nav>
              </div>

              <div className="p-6">
         
              {activeTab === "submissions" ? (
  <div className="space-y-4">
    {submissions.length > 0 ? (
      submissions.map((submission) => (
        <div
          key={submission._id}
          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded"
        >
          <div className="flex items-center">
            <div className="mr-3">
              {submission.status === "ACCEPTED" ? (
                <span className="text-green-500">✓</span>
              ) : (
                <span className="text-red-500">✗</span>
              )}
            </div>
            <div>
              <a
                href={`/problems/${submission.problemId}`}
                className="font-medium hover:text-blue-600 dark:hover:text-blue-400"
              >
                {submission.problemTitle || `Problem #${submission.problemId}`} - {submission.language.charAt(0).toUpperCase() + submission.language.slice(1)}
              </a>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(submission.timestamp)}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm">
              Runtime: {submission.executionTime || "N/A"}ms
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Memory: {submission.memoryUsed || "N/A"}MB
            </div>
          </div>
        </div>
      ))
    ) : (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No submissions yet. Start solving problems!
      </div>
    )}
  </div>

                ) : (
                  <div>
                    <div className="h-96 flex items-center justify-center">
                      <div className="text-center text-gray-500 dark:text-gray-400">
                        {statistics.totalSolved > 0 ? (
                          <>
                            <p className="text-4xl font-bold">{statistics.totalSolved}</p>
                            <p className="text-xl mt-2">Problems Solved</p>
                            <p className="mt-4">Success Rate: {statistics.successRate}%</p>
                            <p>Ranking: #{statistics.ranking}</p>
                          </>
                        ) : (
                          <>
                            <p className="mb-4">Statistics data is still being gathered.</p>
                            <p>Solve more problems to see your progress over time!</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}