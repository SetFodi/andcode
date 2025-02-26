"use client";
import React, { useState, useEffect } from "react";
import { LineChart, PieChart, Line, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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
  Code2,
  Github,
  Mail,
  MapPin,
  Link as LinkIcon,
  Download,
  Cpu,
  Eye,
  Settings,
  AlertCircle
} from "lucide-react";

export default function UserProfile({ userId, userData, submissions, statistics }) {
  const [activeTab, setActiveTab] = useState("submissions");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animatedStats, setAnimatedStats] = useState({
    totalSolved: 0,
    successRate: 0
  });

  useEffect(() => {
    if (userId) {
      setIsLoading(false);
    }
  }, [userId]);

  // Animate the stats counters
  useEffect(() => {
    if (!isLoading && statistics) {
      const duration = 1500;
      const interval = 20;
      const steps = duration / interval;
      
      let currentStep = 0;
      
      const timer = setInterval(() => {
        currentStep += 1;
        const progress = Math.min(currentStep / steps, 1);
        
        setAnimatedStats({
          totalSolved: Math.round(progress * statistics.totalSolved),
          successRate: Math.round(progress * statistics.successRate)
        });
        
        if (currentStep >= steps) {
          clearInterval(timer);
        }
      }, interval);
      
      return () => clearInterval(timer);
    }
  }, [isLoading, statistics]);

  const formatDate = (date) => {
    if (!date) return "Unknown";
    
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTimeAgo = (date) => {
    if (!date) return "Unknown";
    
    const now = new Date();
    const pastDate = new Date(date);
    const diffTime = Math.abs(now - pastDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    
    if (diffDays < 30) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
    
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) {
      return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
    }
    
    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
  };

  const calculatePercentage = (value, total) => {
    if (!total) return 0;
    return (value / total) * 100;
  };

  const totalProblems =
    (statistics?.difficultyBreakdown?.easy || 0) +
    (statistics?.difficultyBreakdown?.medium || 0) +
    (statistics?.difficultyBreakdown?.hard || 0);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-pulse rounded-full h-24 w-24 bg-gray-200 dark:bg-gray-700"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-gray-50 dark:bg-gray-900 rounded-xl">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg flex items-center gap-4 shadow-md">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <div>
            <h2 className="text-xl font-semibold text-red-700 dark:text-red-400">Error Loading Profile</h2>
            <p className="text-red-600 dark:text-red-300 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const COLORS = ["#10B981", "#F59E0B", "#EF4444"];
  const difficultyData = [
    { name: "Easy", value: statistics?.difficultyBreakdown?.easy || 0 },
    { name: "Medium", value: statistics?.difficultyBreakdown?.medium || 0 },
    { name: "Hard", value: statistics?.difficultyBreakdown?.hard || 0 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {userData && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 mb-5">
                  {userData.avatarUrl ? (
                    <img
                      src={userData.avatarUrl}
                      alt={userData.username}
                      className="rounded-full w-32 h-32 object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-5xl font-bold">
                        {userData.username ? userData.username.charAt(0).toUpperCase() : "U"}
                      </span>
                    </div>
                  )}

                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {userData.username || "Anonymous User"}
                </h2>
                
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(userData.createdAt)}</span>
                </div>
                
                {userData.bio && (
                  <p className="text-center text-gray-600 dark:text-gray-400 mb-4 italic">
                    "{userData.bio}"
                  </p>
                )}
                
                <div className="w-full space-y-4">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Global Rank</span>
                      <Trophy className="w-5 h-5 text-yellow-300" />
                    </div>
                    <div className="text-3xl font-bold mt-2 flex items-baseline gap-1">
                      #{statistics?.ranking || "N/A"}
                      <span className="text-sm text-blue-200">of all users</span>
                    </div>
                  </div>
                </div>
                
                {/* Profile links */}
                {(userData.github || userData.email || userData.website || userData.location) && (
                  <div className="w-full mt-5 border-t border-gray-200 dark:border-gray-700 pt-5 space-y-3">
                    {userData.github && (
                      <a 
                        href={`https://github.com/${userData.github}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <Github className="w-5 h-5" />
                        <span className="truncate">{userData.github}</span>
                      </a>
                    )}
                    
                    {userData.email && (
                      <a 
                        href={`mailto:${userData.email}`}
                        className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <Mail className="w-5 h-5" />
                        <span className="truncate">{userData.email}</span>
                      </a>
                    )}
                    
                    {userData.website && (
                      <a 
                        href={userData.website}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <LinkIcon className="w-5 h-5" />
                        <span className="truncate">{userData.website.replace(/(^\w+:|^)\/\//, '')}</span>
                      </a>
                    )}
                    
                    {userData.location && (
                      <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                        <MapPin className="w-5 h-5" />
                        <span>{userData.location}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Progress Cards */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold flex items-center gap-2">
                    <Zap className="w-5 h-5 text-green-500" />
                    Problem Breakdown
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{totalProblems} total</span>
                </div>
                
                <div className="space-y-4">
                  {difficultyData.map((entry, index) => (
                    <div key={entry.name}>
                      <div className="flex justify-between mb-1 text-sm">
                        <span className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full bg-[${COLORS[index]}]`} />
                          {entry.name}
                        </span>
                        <span>{entry.value}</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
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

              {/* Small Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3 text-green-600 dark:text-green-500 mb-2">
                    <CheckCircle className="w-6 h-6" />
                    <span className="text-lg font-semibold">Success</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {animatedStats.successRate}%
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3 text-blue-600 dark:text-blue-500 mb-2">
                    <Cpu className="w-6 h-6" />
                    <span className="text-lg font-semibold">Solved</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {animatedStats.totalSolved}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
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
                    {submissions && submissions.length > 0 ? (
                      submissions.map((submission) => (
                        <div
                          key={submission._id}
                          className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer border border-gray-200 dark:border-gray-600 hover:border-blue-200 dark:hover:border-blue-800"
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
                              <div className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {submission.problemTitle || "Unknown Problem"}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                                <span className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-md text-xs">
                                  {submission.language || "Unknown"}
                                </span>
                                <span>{formatTimeAgo(submission.createdAt || submission.timestamp)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-mono">
                              <span className="text-green-500 dark:text-green-400">{submission.executionTime || 0}ms</span>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {(submission.memoryUsed || 0)}MB
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-16 bg-gray-50 dark:bg-gray-700 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                        <div className="mb-4 text-gray-400 dark:text-gray-500">
                          <HardDriveDownload className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-xl font-medium mb-2">No submissions yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                          Start solving problems to track your progress!
                        </p>
                        <a 
                          href="/problems" 
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Browse Problems
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
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
                            <Tooltip 
                              formatter={(value, name) => [`${value} problems`, name]}
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                borderRadius: '8px',
                                border: 'none',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                              }}
                            />
                            <text
                              x="50%"
                              y="50%"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className="text-2xl font-bold"
                              fill="#333"
                            >
                              {statistics?.totalSolved || 0}
                            </text>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex justify-center gap-6 mt-4">
                        {difficultyData.map((entry, index) => (
                          <div key={`legend-${index}`} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">{entry.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h4 className="font-bold mb-4 flex items-center gap-2">
                          <Activity className="w-5 h-5 text-purple-500" />
                          Weekly Activity
                        </h4>
                        <div className="h-48">
                          {statistics?.activityGraph && statistics.activityGraph.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={statistics.activityGraph}>
                                <XAxis 
                                  dataKey="date" 
                                  stroke="#888888" 
                                  fontSize={12}
                                  tickLine={false}
                                  axisLine={false}
                                />
                                <YAxis 
                                  stroke="#888888" 
                                  fontSize={12}
                                  tickLine={false}
                                  axisLine={false}
                                  tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip 
                                  formatter={(value) => [`${value} submissions`]}
                                  contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    borderRadius: '8px',
                                    border: 'none',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                  }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="submissions"
                                  stroke="#6366F1"
                                  strokeWidth={2}
                                  dot={{ r: 4, fill: "#6366F1" }}
                                  activeDot={{ r: 6, fill: "#4F46E5" }}
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
                        <div className="bg-green-50 dark:bg-green-900/20 p-5 rounded-xl border border-green-100 dark:border-green-800/30">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {statistics?.successRate || 0}%
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2 mt-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            Success Rate
                          </div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-xl border border-blue-100 dark:border-blue-800/30">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {statistics?.totalSubmissions || 0}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2 mt-1">
                            <Download className="w-4 h-4 text-blue-500" />
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