"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Star, ChevronDown, ChevronUp, Search, User, FilterX } from "lucide-react";

export default function LeaderboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("rank"); // rank, problems, submissions
  const [sortOrder, setSortOrder] = useState("asc"); // asc, desc

  useEffect(() => {
    // Simulating API call to fetch leaderboard data
    const fetchLeaderboardData = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, you would fetch actual data from your API
        // const response = await fetch('/api/leaderboard');
        // const data = await response.json();
        
        // For demo purposes, we'll use sample data
        const sampleData = [
          { id: 1, rank: 1, username: "codeMaster", totalSolved: 245, submissions: 298, successRate: 82 },
          { id: 2, rank: 2, username: "devNinja", totalSolved: 239, submissions: 280, successRate: 85 },
          { id: 3, rank: 3, username: "algorithmQueen", totalSolved: 221, submissions: 260, successRate: 85 },
          { id: 4, rank: 4, username: "bugHunter", totalSolved: 215, submissions: 270, successRate: 80 },
          { id: 5, rank: 5, username: "codeWizard", totalSolved: 208, submissions: 250, successRate: 83 },
          { id: 6, rank: 6, username: "syntaxSage", totalSolved: 195, submissions: 240, successRate: 81 },
          { id: 7, rank: 7, username: "debuggerKing", totalSolved: 183, submissions: 220, successRate: 83 },
          { id: 8, rank: 8, username: "programmingPro", totalSolved: 176, submissions: 210, successRate: 84 },
          { id: 9, rank: 9, username: "logicLegend", totalSolved: 165, submissions: 200, successRate: 83 },
          { id: 10, rank: 10, username: "binaryBaron", totalSolved: 159, submissions: 195, successRate: 82 },
          { id: 11, rank: 11, username: "techGuru", totalSolved: 145, submissions: 180, successRate: 81 },
          { id: 12, rank: 12, username: "hackMaster", totalSolved: 138, submissions: 170, successRate: 81 },
          { id: 13, rank: 13, username: "codeArtist", totalSolved: 128, submissions: 160, successRate: 80 },
          { id: 14, rank: 14, username: "algoArchitect", totalSolved: 119, submissions: 150, successRate: 79 },
          { id: 15, rank: 15, username: "devDragon", totalSolved: 110, submissions: 140, successRate: 79 },
        ];
        
        // Simulate network delay
        setTimeout(() => {
          setLeaderboardData(sampleData);
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        console.error("Error fetching leaderboard data:", err);
        setError("Failed to load leaderboard data. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  const toggleSortOrder = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const filteredData = leaderboardData
    .filter(user => 
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === "rank") {
        comparison = a.rank - b.rank;
      } else if (sortBy === "problems") {
        comparison = a.totalSolved - b.totalSolved;
      } else if (sortBy === "submissions") {
        comparison = a.submissions - b.submissions;
      } else if (sortBy === "successRate") {
        comparison = a.successRate - b.successRate;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return <Trophy className="w-5 h-5 text-yellow-500" />;
    } else if (rank === 2) {
      return <Medal className="w-5 h-5 text-gray-400" />;
    } else if (rank === 3) {
      return <Medal className="w-5 h-5 text-amber-700" />;
    } else {
      return <span className="text-gray-500">#{rank}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-2">
          Global Leaderboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Top performers ranked by problems solved across all categories
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <FilterX className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
          <div className="animate-pulse">
            <div className="mx-auto w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded max-w-md mx-auto mb-2.5"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded max-w-sm mx-auto"></div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">
                    Rank
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSortOrder("problems")}
                  >
                    <div className="flex items-center gap-2">
                      <span>Problems Solved</span>
                      {sortBy === "problems" && (
                        sortOrder === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSortOrder("submissions")}
                  >
                    <div className="flex items-center gap-2">
                      <span>Submissions</span>
                      {sortBy === "submissions" && (
                        sortOrder === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSortOrder("successRate")}
                  >
                    <div className="flex items-center gap-2">
                      <span>Success Rate</span>
                      {sortBy === "successRate" && (
                        sortOrder === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredData.map((user) => (
                  <tr 
                    key={user.id} 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${user.rank <= 3 ? 'bg-yellow-50/40 dark:bg-yellow-900/10' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        {getRankBadge(user.rank)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{user.totalSolved}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{user.submissions}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-grow mr-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 w-24">
                          <div 
                            className="bg-green-500 h-2.5 rounded-full" 
                            style={{ width: `${user.successRate}%` }}
                          ></div>
                        </div>
                        <div className="text-sm text-gray-900 dark:text-white">{user.successRate}%</div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-8">
              <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No users found matching your search</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}