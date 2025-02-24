"use client";
import React, { useState, useEffect } from "react";
import { LineChart, PieChart, Line, Pie, Cell, ResponsiveContainer } from "recharts";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Star, 
  Trophy, 
  Activity, 
  HardDriveDownload,
  Zap,
  User,
  Calendar,
  BarChart4,
  Code2
} from "lucide-react";

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

  const COLORS = ["#10B981", "#F59E0B", "#EF4444"];
  const difficultyData = [
    { name: "Easy", value: statistics.difficultyBreakdown.easy },
    { name: "Medium", value: statistics.difficultyBreakdown.medium },
    { name: "Hard", value: statistics.difficultyBreakdown.hard }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-pulse rounded-full h-24 w-24 bg-gray-200 dark:bg-gray-700"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {userData && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 mb-4">
                  {userData.avatarUrl ? (
                    <img
                      src={userData.avatarUrl}
                      alt={userData.username}
                      className="rounded-full w-32 h-32 object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <User className="w-16 h-16 text-blue-500 dark:text-blue-400" />
                    </div>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {userData.username}
                </h2>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
                  <Calendar className="w-5 h-5" />
                  <span>Joined {formatDate(userData.createdAt)}</span>
                </div>
                
                <div className="w-full space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Global Rank</span>
                      <Trophy className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold mt-2">
                      #{statistics.ranking || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Cards */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-green-500" />
                  Problem Breakdown
                </h3>
                <div className="space-y-4">
                  {difficultyData.map((entry, index) => (
                    <div key={entry.name}>
                      <div className="flex justify-between mb-1 text-sm">
                        <span className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${COLORS[index]}`} />
                          {entry.name}
                        </span>
                        <span>{entry.value}</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${calculatePercentage(entry.value, totalProblems)}%`,
                            backgroundColor: COLORS[index]
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-500" />
                  Activity Graph
                </h3>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={statistics.activityGraph}>
                      <Line
                        type="monotone"
                        dataKey="submissions"
                        stroke="#6366F1"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
              {/* Tabs */}
              <div className="border-b border-gray-100 dark:border-gray-700">
                <nav className="flex gap-2 px-6">
                  <button
                    onClick={() => setActiveTab("submissions")}
                    className={`px-4 py-3 font-medium flex items-center gap-2 ${
                      activeTab === "submissions"
                        ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    <Code2 className="w-5 h-5" />
                    Submissions
                  </button>
                  <button
                    onClick={() => setActiveTab("statistics")}
                    className={`px-4 py-3 font-medium flex items-center gap-2 ${
                      activeTab === "statistics"
                        ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    <BarChart4 className="w-5 h-5" />
                    Statistics
                  </button>
                </nav>
              </div>

              {/* Content */}
              <div className="p-6">
                {activeTab === "submissions" ? (
                  <div className="space-y-4">
                    {submissions.length > 0 ? (
                      submissions.map((submission) => (
                        <div
                          key={submission._id}
                          className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                          onClick={() => window.location.href = `/problems/${submission.problemId}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 flex items-center justify-center">
                              {submission.status === "ACCEPTED" ? (
                                <CheckCircle className="w-6 h-6 text-green-500" />
                              ) : (
                                <XCircle className="w-6 h-6 text-red-500" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">
                                {submission.problemTitle}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                <span className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-md text-xs">
                                  {submission.language}
                                </span>
                                <span>{formatDate(submission.timestamp)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-mono">
                              <span className="text-green-500">{submission.executionTime}ms</span>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {submission.memoryUsed}MB
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="mb-4 text-gray-400 dark:text-gray-500">
                          <HardDriveDownload className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No submissions yet</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          Start solving problems to track your progress!
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                      <h4 className="font-bold mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        Solved Problems
                      </h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={difficultyData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {difficultyData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <text
                              x="50%"
                              y="50%"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className="text-2xl font-bold"
                            >
                              {statistics.totalSolved}
                            </text>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="space-y-6">
  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
    <h4 className="font-bold mb-4 flex items-center gap-2">
      <Activity className="w-5 h-5 text-purple-500" />
      Weekly Activity
    </h4>
    <div className="h-48">
      {statistics.activityGraph && statistics.activityGraph.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={statistics.activityGraph}>
            <Line
              type="monotone"
              dataKey="submissions"
              stroke="#6366F1"
              strokeWidth={2}
              dot={{ r: 4, fill: "#6366F1" }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          No activity data available for the past week
        </div>
      )}
    </div>
  </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-500/10 p-4 rounded-xl">
                          <div className="text-2xl font-bold text-green-500">
                            {statistics.successRate}%
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            Success Rate
                          </div>
                        </div>
                        <div className="bg-blue-500/10 p-4 rounded-xl">
                          <div className="text-2xl font-bold text-blue-500">
                            {statistics.totalSubmissions}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            Total Submissions
                          </div>
                        </div>
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