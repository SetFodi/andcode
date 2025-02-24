'use client';
import React, { useState, useEffect } from 'react';

export default function UserProfile({ userId }) {
  const [profile, setProfile] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({
    totalSolved: 0,
    successRate: 0,
    ranking: 0,
    difficultyBreakdown: {
      easy: 0,
      medium: 0,
      hard: 0
    }
  });
  const [activeTab, setActiveTab] = useState('submissions');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      console.log("UserProfile: Starting data fetch for userId:", userId);
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch user profile
      console.log(`UserProfile: Fetching user data with ID: ${userId}`);
      
      // Debugging log to check the exact URL being called
      const profileUrl = `/api/users/${userId}`;
      console.log(`UserProfile: Calling API at: ${profileUrl}`);
      
      const profileResponse = await fetch(profileUrl, {
        method: 'GET',
        credentials: 'include', // Important for cookies
      });
      
      console.log(`UserProfile: Profile API response status: ${profileResponse.status}`);
      
      if (!profileResponse.ok) {
        // Enhanced error with more details to help debug
        const errorText = await profileResponse.text().catch(() => 'No error details');
        console.error(`UserProfile: API error response: ${errorText}`);
        throw new Error(`Failed to fetch user profile: ${profileResponse.status}`);
      }
      
      const profileData = await profileResponse.json();
      console.log("UserProfile: User data received", profileData);
      setProfile(profileData);
      
      // After successfully loading profile, fetch statistics and submissions
      await Promise.all([fetchStatistics(), fetchSubmissions()]);
      
      setError(null);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setError(`Failed to load user profile data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchStatistics = async () => {
    try {
      console.log(`UserProfile: Fetching statistics for userId: ${userId}`);
      const statsResponse = await fetch(`/api/users/${userId}/statistics`, {
        method: 'GET',
        credentials: 'include',
      });
      
      console.log(`UserProfile: Statistics API response status: ${statsResponse.status}`);
      
      if (!statsResponse.ok) {
        console.warn(`UserProfile: Statistics fetch failed with status: ${statsResponse.status}`);
        // Don't throw here, just return default stats
        return;
      }
      
      const statsData = await statsResponse.json();
      console.log("UserProfile: Statistics data received", statsData);
      
      // Update stats from actual data
      setStats({
        totalSolved: statsData.totalSolved || 0,
        successRate: statsData.successRate || 0,
        ranking: statsData.ranking || 0,
        difficultyBreakdown: {
          easy: statsData.difficultyBreakdown?.easy || 0,
          medium: statsData.difficultyBreakdown?.medium || 0,
          hard: statsData.difficultyBreakdown?.hard || 0
        }
      });
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      // Don't set main error - we want to show the profile even if stats fail
    }
  };
  
  const fetchSubmissions = async () => {
    try {
      console.log(`UserProfile: Fetching submissions for userId: ${userId}`);
      const submissionsResponse = await fetch(`/api/users/${userId}/submissions?limit=10`, {
        method: 'GET',
        credentials: 'include',
      });
      
      console.log(`UserProfile: Submissions API response status: ${submissionsResponse.status}`);
      
      if (!submissionsResponse.ok) {
        console.warn(`UserProfile: Submissions fetch failed with status: ${submissionsResponse.status}`);
        // Don't throw here, just return empty submissions
        return;
      }
      
      const submissionsData = await submissionsResponse.json();
      console.log("UserProfile: Submissions data received", submissionsData);
      setSubmissions(submissionsData.submissions || []);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      // Don't set main error - we want to show the profile even if submissions fail
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate percentages for difficulty breakdown bars
  const calculatePercentage = (value, total) => {
    if (!total) return 0;
    return (value / total) * 100;
  };
  
  const totalProblems = stats.difficultyBreakdown.easy + 
                       stats.difficultyBreakdown.medium + 
                       stats.difficultyBreakdown.hard;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => fetchUserData()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Retry
        </button>
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-gray-100 rounded text-xs max-w-md overflow-auto">
            <p>Debug Info:</p>
            <pre>User ID: {userId || 'null'}</pre>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {profile && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4 flex items-center justify-center">
                  {profile.avatarUrl ? (
                    <img 
                      src={profile.avatarUrl} 
                      alt={profile.username} 
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">👤</span>
                  )}
                </div>
                <h2 className="text-xl font-bold mb-2">{profile.username}</h2>
                <p className="text-gray-600 mb-4">Joined {formatDate(profile.createdAt || new Date())}</p>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-600">Problems Solved</span>
                  <span className="font-bold">{stats.totalSolved}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-bold">{stats.successRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Ranking</span>
                  <span className="font-bold">#{stats.ranking || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Progress Card */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h3 className="font-bold mb-4">Difficulty Breakdown</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-green-500">Easy</span>
                    <span>{stats.difficultyBreakdown.easy}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded">
                    <div
                      className="h-full bg-green-500 rounded"
                      style={{ width: `${calculatePercentage(stats.difficultyBreakdown.easy, totalProblems)}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-yellow-500">Medium</span>
                    <span>{stats.difficultyBreakdown.medium}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded">
                    <div
                      className="h-full bg-yellow-500 rounded"
                      style={{ width: `${calculatePercentage(stats.difficultyBreakdown.medium, totalProblems)}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-red-500">Hard</span>
                    <span>{stats.difficultyBreakdown.hard}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded">
                    <div
                      className="h-full bg-red-500 rounded"
                      style={{ width: `${calculatePercentage(stats.difficultyBreakdown.hard, totalProblems)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow">
              <div className="border-b">
                <nav className="flex">
                  <button
                    className={`px-6 py-3 text-sm font-medium ${
                      activeTab === 'submissions'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('submissions')}
                  >
                    Submissions
                  </button>
                  <button
                    className={`px-6 py-3 text-sm font-medium ${
                      activeTab === 'statistics'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('statistics')}
                  >
                    Statistics
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'submissions' ? (
                  <div className="space-y-4">
                    {submissions.length > 0 ? (
                      submissions.map((submission) => (
                        <div
                          key={submission._id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded"
                        >
                          <div className="flex items-center">
                            <div className="mr-3">
                              {submission.status === 'ACCEPTED' ? (
                                <span className="text-green-500">✓</span>
                              ) : (
                                <span className="text-red-500">✗</span>
                              )}
                            </div>
                            <div>
                              <a
                                href={`/problems/${submission.problemId}`}
                                className="font-medium hover:text-blue-600"
                              >
                                {submission.problemTitle || 'Problem #' + submission.problemId}
                              </a>
                              <div className="text-sm text-gray-500">
                                {formatDate(submission.timestamp)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm">
                              Runtime: {submission.executionTime || 'N/A'}ms
                            </div>
                            <div className="text-sm text-gray-500">
                              Memory: {submission.memoryUsed || 'N/A'}MB
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No submissions yet. Start solving problems!
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="h-96 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <p className="mb-4">Statistics data is still being gathered.</p>
                        <p>Solve more problems to see your progress over time!</p>
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