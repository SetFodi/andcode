"use client";
import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  SignalHigh, 
  SignalMedium, 
  SignalLow, 
  Hash, 
  ListTree, 
  Workflow,
  BookOpen,
  Code,
  Award,
  Link2,
  Timer,
  X,
  Database,
  BarChart3
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

export default function ProblemsList() {
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    difficulty: "",
    category: "",
    search: "",
    page: 1,
    sortBy: "newest" // Default sort
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    current: 1,
  });
  const [acceptedProblems, setAcceptedProblems] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);


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
        sortBy: filters.sortBy
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

  const getDifficultyBgColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
      case "medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
      case "hard":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800";
    }
  };

  const getStatusBadge = (problemId) => {
    if (acceptedProblems.has(problemId)) {
      return (
        <div className="flex items-center px-2 py-1 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-full text-xs font-medium border border-green-200 dark:border-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Solved
        </div>
      );
    } 
    return (
      <div className="flex items-center px-2 py-1 bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-700">
        <Timer className="w-3 h-3 mr-1" />
        Unsolved
      </div>
    );
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
        return <Database className="w-4 h-4 text-purple-500" />;
      case "strings":
        return <Workflow className="w-4 h-4 text-blue-500" />;
      case "trees":
        return <ListTree className="w-4 h-4 text-green-500" />;
      case "linked-lists":
        return <Link2 className="w-4 h-4 text-indigo-500" />;
      case "dynamic-programming":
        return <Code className="w-4 h-4 text-amber-500" />;
      default:
        return <Hash className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryBgColor = (category) => {
    switch (category.toLowerCase()) {
      case "arrays":
        return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800";
      case "strings":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
      case "linked-lists":
        return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800";
      case "trees":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
      case "dynamic-programming":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/40 dark:text-gray-400 dark:border-gray-700";
    }
  };

  const resetFilters = () => {
    setFilters({
      difficulty: "",
      category: "",
      search: "",
      page: 1,
      sortBy: "newest"
    });
  };

  const clearSearch = () => {
    setFilters(f => ({...f, search: "", page: 1}));
  };

  const getStatusColor = (status) => {
    switch(status?.toUpperCase()) {
      case "ACCEPTED":
        return "text-green-500 dark:text-green-400";
      case "WRONG_ANSWER":
        return "text-red-500 dark:text-red-400";
      case "TIME_LIMIT_EXCEEDED":
        return "text-yellow-500 dark:text-yellow-400";
      default:
        return "text-gray-500 dark:text-gray-400";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-gray-900">
      {/* Header Section with Gradient & Stats */}
      <div className="mb-8 relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500 opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500 opacity-10 rounded-full blur-3xl"></div>
        
        <div className="relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                Coding Challenges
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Sharpen your problem-solving skills with our curated collection
              </p>
            </div>
            
            {user && (
              <div className="flex items-center gap-3 md:gap-6 flex-wrap">
                <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 shadow-sm rounded-xl p-3 min-w-[100px]">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {acceptedProblems.size}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Problems Solved</span>
                </div>
                
                <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 shadow-sm rounded-xl p-3 min-w-[100px]">
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {Math.min(Math.round((acceptedProblems.size / (pagination.total || 1)) * 100), 100)}%
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Completion</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar for filters and stats on larger screens */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-6">
            {/* Mobile Filter Toggle */}
            <div className="block lg:hidden">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </span>
              </button>
            </div>
            
            {/* Filter Section - Hidden on mobile unless toggled */}
            <div className={`space-y-5 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-500" />
                  Filters
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Difficulty
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["Easy", "Medium", "Hard"].map((diff) => (
                        <button
                          key={diff}
                          onClick={() => setFilters(f => ({...f, difficulty: f.difficulty === diff.toLowerCase() ? "" : diff.toLowerCase(), page: 1}))}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
                            filters.difficulty === diff.toLowerCase() 
                              ? getDifficultyBgColor(diff)
                              : "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                          }`}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <div className="space-y-2">
                      {["Arrays", "Strings", "Linked-Lists", "Trees", "Dynamic-Programming"].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setFilters(f => ({...f, category: f.category === cat.toLowerCase() ? "" : cat.toLowerCase(), page: 1}))}
                          className={`flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium border ${
                            filters.category === cat.toLowerCase() 
                              ? getCategoryBgColor(cat)
                              : "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                          }`}
                        >
                          {getCategoryIcon(cat)}
                          <span className="ml-2">{cat.replace('-', ' ')}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sort By
                    </label>
                    <select
                      className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      value={filters.sortBy}
                      onChange={(e) => setFilters(f => ({...f, sortBy: e.target.value, page: 1}))}
                    >
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                      <option value="most-solved">Most Solved</option>
                      <option value="least-solved">Least Solved</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={resetFilters}
                    className="w-full flex items-center justify-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm font-medium"
                  >
                    <X className="w-4 h-4" />
                    Clear All Filters
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
        
        {/* Main Problem List Area */}
        <div className="lg:col-span-3">
          {/* Search Bar */}
          <div className="relative mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search problems by title or keywords..."
              className="w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
            />
            {filters.search && (
              <button 
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
              </button>
            )}
          </div>
          
          {/* Applied Filters Display */}
          {(filters.difficulty || filters.category) && (
            <div className="flex flex-wrap gap-2 mb-5">
              {filters.difficulty && (
                <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getDifficultyBgColor(filters.difficulty)}`}>
                  {getDifficultyIcon(filters.difficulty)}
                  <span>{filters.difficulty.charAt(0).toUpperCase() + filters.difficulty.slice(1)}</span>
                  <button 
                    onClick={() => setFilters(f => ({...f, difficulty: ""}))}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              
              {filters.category && (
                <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getCategoryBgColor(filters.category)}`}>
                  {getCategoryIcon(filters.category)}
                  <span>{filters.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                  <button 
                    onClick={() => setFilters(f => ({...f, category: ""}))}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Problem List */}
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"></div>
              ))}
            </div>
          ) : (
            <>
              <AnimatePresence mode="wait">
                {problems.length > 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    {problems.map((problem, index) => (
                      <motion.div
                        key={problem._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow p-5"
                        onClick={() => (window.location.href = `/problems/${problem._id}`)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusBadge(problem._id)}
                              <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getDifficultyBgColor(problem.difficulty)}`}>
                                {getDifficultyIcon(problem.difficulty)}
                                {problem.difficulty}
                              </div>
                            </div>
                            
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              {problem.title}
                            </h3>
                            
                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <div className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 ${getCategoryBgColor(problem.category)}`}>
                                {getCategoryIcon(problem.category)}
                                <span>{problem.category}</span>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <BarChart3 className="w-4 h-4 text-blue-500" />
                                <span>Success Rate: {problem.successRate?.toFixed(1)}%</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500"
                              style={{ width: `${problem.successRate}%` }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                      No problems found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-6">
                      Try adjusting your filters or search terms to find what you're looking for
                    </p>
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Clear Filters
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pagination */}
              {problems.length > 0 && (
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
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
                    <div className="flex items-center px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300">
                      Page {pagination.current} of {pagination.pages}
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
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}