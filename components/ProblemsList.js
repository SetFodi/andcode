"use client";
import React, { useState, useEffect } from "react";
import { Search, Filter, ChevronLeft, ChevronRight, CheckCircle, SignalHigh, SignalMedium, SignalLow, Hash, ListTree, Workflow } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function ProblemsList() {
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    difficulty: "",
    category: "",
    search: "",
    page: 1,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    current: 1,
  });
  const [acceptedProblems, setAcceptedProblems] = useState(new Set());

  useEffect(() => {
    if (user) {
      fetchAcceptedProblems();
    }
    fetchProblems();
  }, [filters, user]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        difficulty: filters.difficulty,
        category: filters.category,
        search: filters.search,
        page: filters.page,
      });

      const response = await fetch(`/api/problems?${queryParams}`);
      const data = await response.json();
      setProblems(data.problems);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to fetch problems:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAcceptedProblems = async () => {
    if (!user || !user._id) {
      console.log("No user or user._id available, skipping fetchAcceptedProblems");
      return;
    }

    try {
      console.log(`Fetching accepted submissions for userId: ${user._id}`);
      const response = await fetch(`/api/users/${user._id}/submissions?status=ACCEPTED`, {
        credentials: "include",
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch accepted submissions: ${errorText}`);
      }
      const data = await response.json();
      console.log("Accepted submissions response:", data);

      if (!data.submissions || !Array.isArray(data.submissions)) {
        console.warn("No valid submissions array in response:", data);
        setAcceptedProblems(new Set());
        return;
      }

      const acceptedIds = data.submissions.map((sub) => sub.problemId.toString());
      console.log("Accepted problem IDs:", acceptedIds);
      setAcceptedProblems(new Set(acceptedIds));
    } catch (error) {
      console.error("Failed to fetch accepted problems:", error);
      setAcceptedProblems(new Set());
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "text-green-500";
      case "medium":
        return "text-yellow-500";
      case "hard":
        return "text-red-500";
      default:
        return "text-gray-500 dark:text-gray-400";
    }
  };

  const getStatusColor = (problemId) => {
    return acceptedProblems.has(problemId) ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600";
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return <SignalLow className="w-4 h-4 text-green-500" />;
      case "medium":
        return <SignalMedium className="w-4 h-4 text-yellow-500" />;
      case "hard":
        return <SignalHigh className="w-4 h-4 text-red-500" />;
      default:
        return <SignalMedium className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case "arrays":
        return <Hash className="w-4 h-4 text-purple-500" />;
      case "strings":
        return <Workflow className="w-4 h-4 text-blue-500" />;
      case "trees":
        return <ListTree className="w-4 h-4 text-green-500" />;
      default:
        return <Hash className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-gray-900">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Coding Challenges</h1>
        <p className="text-gray-600 dark:text-gray-300">Practice your skills with our curated collection of problems</p>
      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search problems..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 transition-all"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 appearance-none"
            value={filters.difficulty}
            onChange={(e) => setFilters((f) => ({ ...f, difficulty: e.target.value, page: 1 }))}
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 appearance-none"
            value={filters.category}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value, page: 1 }))}
          >
            <option value="">All Categories</option>
            <option value="arrays">Arrays</option>
            <option value="strings">Strings</option>
            <option value="linked-lists">Linked Lists</option>
            <option value="trees">Trees</option>
            <option value="dynamic-programming">Dynamic Programming</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          ))}
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-500 dark:text-gray-300">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-500 dark:text-gray-300">
                      Problem
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-500 dark:text-gray-300">
                      Difficulty
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-500 dark:text-gray-300">
                      Success
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {problems.map((problem) => (
                    <tr
                      key={problem._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                      onClick={() => (window.location.href = `/problems/${problem._id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="h-6 w-6 flex items-center justify-center">
                          {acceptedProblems.has(problem._id) ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="text-blue-500">
                            {getCategoryIcon(problem.category)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {problem.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {problem.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getDifficultyIcon(problem.difficulty)}
                          <span className={`${getDifficultyColor(problem.difficulty)} font-medium`}>
                            {problem.difficulty}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500"
                              style={{ width: `${problem.successRate}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {problem.successRate?.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between px-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((pagination.current - 1) * 10) + 1} -{' '}
              {Math.min(pagination.current * 10, pagination.total)} of{' '}
              {pagination.total} problems
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                disabled={pagination.current === 1}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center px-4 text-gray-700 dark:text-gray-300">
                Page {pagination.current}
              </div>
              <button
                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                disabled={pagination.current === pagination.pages}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}

      {!loading && problems.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
          <div className="text-6xl mb-4 text-gray-300 dark:text-gray-600">🧩</div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            No problems found
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Try adjusting your filters or search terms
          </p>
        </div>
      )}
    </div>
  );
}