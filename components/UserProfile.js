import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Award, GitBranch, Star, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function UserProfile({ userId }) {
  const [profile, setProfile] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({
    totalSolved: 0,
    successRate: 0,
    streak: 0,
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
    fetchUserData();
    fetchSubmissions();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${userId}`, {
        method: 'GET',
        credentials: 'include', // Important for cookies
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.status}`);
      }
      
      const data = await response.json();
      setProfile(data);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setError('Failed to load user profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/submissions`, {
        method: 'GET',
        credentials: 'include', // Important for cookies
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch submissions: ${response.status}`);
      }
      
      const data = await response.json();
      setSubmissions(data);
      
      // Calculate statistics
      if (data.length > 0) {
        // Create a set of solved problem IDs to count unique problems
        const solved = new Set(data
          .filter(s => s.status === 'ACCEPTED')
          .map(s => s.problemId));
        
        // Calculate success rate
        const successRate = data.length > 0 
          ? (data.filter(s => s.status === 'ACCEPTED').length / data.length) * 100 
          : 0;
        
        // Count problems by difficulty
        const difficultyMap = data.reduce((acc, sub) => {
          if (sub.status === 'ACCEPTED' && sub.difficulty) {
            acc[sub.difficulty.toLowerCase()] = (acc[sub.difficulty.toLowerCase()] || 0) + 1;
          }
          return acc;
        }, {});
        
        setStats(prev => ({
          ...prev,
          totalSolved: solved.size,
          successRate: successRate.toFixed(1),
          difficultyBreakdown: {
            easy: difficultyMap.easy || 0,
            medium: difficultyMap.medium || 0,
            hard: difficultyMap.hard || 0
          }
        }));
      }
      
      setError(null);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      setError('Failed to load user submissions');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
          onClick={() => { fetchUserData(); fetchSubmissions(); }}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Retry
        </button>
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
                <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4">
                  <img
                    src={profile.avatar || '/default-avatar.png'}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                </div>
                <h2 className="text-xl font-bold mb-2">{profile.username}</h2>
                <p className="text-gray-600 mb-4">Joined {formatDate(profile.createdAt)}</p>
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
                      style={{ 
                        width: stats.totalSolved ? 
                          `${(stats.difficultyBreakdown.easy / stats.totalSolved) * 100}%` : '0%'
                      }}
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
                      style={{ 
                        width: stats.totalSolved ? 
                          `${(stats.difficultyBreakdown.medium / stats.totalSolved) * 100}%` : '0%'
                      }}
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
                      style={{ 
                        width: stats.totalSolved ? 
                          `${(stats.difficultyBreakdown.hard / stats.totalSolved) * 100}%` : '0%'
                      }}
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
                            {submission.status === 'ACCEPTED' ? (
                              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500 mr-3" />
                            )}
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
                              Runtime: {submission.executionTime}ms
                            </div>
                            <div className="text-sm text-gray-500">
                              Memory: {submission.memoryUsed}KB
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
                  <div className="h-96">
                    {submissions.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={submissions.map(s => ({
                            date: formatDate(s.timestamp),
                            executionTime: s.executionTime,
                            problemId: s.problemId,
                            status: s.status
                          }))}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="executionTime" fill="#8884d8" name="Runtime (ms)" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No data available for visualization
                      </div>
                    )}
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