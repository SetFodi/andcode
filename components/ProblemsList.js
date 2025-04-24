"use client";
import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  AlertCircle,
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
  BarChart3,
  TrendingUp,
  LayoutGrid,
  ListFilter,
  Zap,
  ArrowUpDown,
  Lock,
  Cpu,
  Eye,
  Plus,
  Sparkles,
  FileQuestion,
  Flame,
  Crown
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
    status: "",
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
  const [viewMode, setViewMode] = useState("grid"); // Default to grid view for better visuals
  const [isFilterAnimating, setIsFilterAnimating] = useState(false);
  const [showTooltip, setShowTooltip] = useState("");

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
        status: filters.status,
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
    if (!user || !user._id) return;

    try {
      const response = await fetch(`/api/users/${user._id}/submissions?status=ACCEPTED`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch accepted submissions");
      }
      
      const data = await response.json();
      
      if (!data.submissions || !Array.isArray(data.submissions)) {
        setAcceptedProblems(new Set());
        return;
      }

      const acceptedIds = data.submissions.map((sub) => sub.problemId.toString());
      setAcceptedProblems(new Set(acceptedIds));
    } catch (error) {
      console.error("Failed to fetch accepted problems:", error);
      setAcceptedProblems(new Set());
    }
  };
  
  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "text-green-500 dark:text-green-400";
      case "medium":
        return "text-yellow-500 dark:text-yellow-400";
      case "hard":
        return "text-red-500 dark:text-red-400";
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

  const getStatusBadge = (problemId, premium = false) => {
    if (premium && !user?.premium) {
      return (
        <div className="flex items-center px-2 py-1 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 rounded-full text-xs font-medium border border-purple-200 dark:border-purple-800">
          <Lock className="w-3 h-3 mr-1" />
          Premium
        </div>
      );
    }
    
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
        return <SignalLow className="w-4 h-4 text-green-500 dark:text-green-400" />;
      case "medium":
        return <SignalMedium className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />;
      case "hard":
        return <SignalHigh className="w-4 h-4 text-red-500 dark:text-red-400" />;
      default:
        return <SignalMedium className="w-4 h-4 text-gray-500 dark:text-gray-400" />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case "arrays":
        return <Database className="w-4 h-4 text-purple-500 dark:text-purple-400" />;
      case "strings":
        return <Workflow className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
      case "trees":
        return <ListTree className="w-4 h-4 text-green-500 dark:text-green-400" />;
      case "linked-lists":
        return <Link2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />;
      case "dynamic-programming":
        return <Code className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
      default:
        return <FileQuestion className="w-4 h-4 text-gray-500 dark:text-gray-400" />;
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
    setIsFilterAnimating(true);
    setTimeout(() => {
      setFilters({
        difficulty: "",
        category: "",
        status: "",
        search: "",
        page: 1,
        sortBy: "newest"
      });
      setIsFilterAnimating(false);
    }, 300);
  };

  const clearSearch = () => {
    setFilters(f => ({...f, search: "", page: 1}));
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

  // Helper function to get difficulty level number
  const getDifficultyLevel = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case "easy": return 1;
      case "medium": return 2;
      case "hard": return 3;
      default: return 0;
    }
  };

  // Get content for the grid view card
  const renderGridItem = (problem, index) => (
    <motion.div
      key={problem._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ 
        y: -5, 
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        transition: { duration: 0.2 }
      }}
      className="group bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
      onClick={() => (window.location.href = `/problems/${problem._id}`)}
    >
      {/* Card Header with difficulty indicator */}
      <div className="relative">
        <div className={`h-1.5 ${
          problem.difficulty === "easy" ? "bg-gradient-to-r from-green-400 to-green-500" :
          problem.difficulty === "medium" ? "bg-gradient-to-r from-yellow-400 to-yellow-500" :
          "bg-gradient-to-r from-red-400 to-red-500"
        }`}></div>

        {/* Premium badge if applicable */}
        {problem.premium && (
          <div className="absolute top-3 right-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
              <Crown className="w-3 h-3" />
              PRO
            </div>
          </div>
        )}
        
        {/* New or Featured badge */}
        {problem.isNew && (
          <div className="absolute top-3 left-3">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              NEW
            </div>
          </div>
        )}
        {(!problem.isNew && problem.featured) && (
          <div className="absolute top-3 left-3">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
              <Flame className="w-3 h-3" />
              HOT
            </div>
          </div>
        )}
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        {/* Status badge and difficulty */}
        <div className="flex justify-between items-center mb-3">
          {getStatusBadge(problem._id, problem.premium)}
          <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getDifficultyBgColor(problem.difficulty)}`}>
            {getDifficultyIcon(problem.difficulty)}
            {problem.difficulty}
          </div>
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-grow">
          {problem.title}
        </h3>
        
        {/* Category */}
        <div className="mt-auto">
          <div className={`px-2 py-1 rounded text-xs flex items-center gap-1 inline-block ${getCategoryBgColor(problem.category)}`}>
            {getCategoryIcon(problem.category)}
            <span>{problem.category.replace('-', ' ')}</span>
          </div>
        </div>
        
        {/* Success rate indicator */}
        <div className="mt-3 w-full">
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Success Rate</span>
            <span className="font-medium">{problem.successRate?.toFixed(1)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                problem.successRate < 30 ? "bg-gradient-to-r from-red-400 to-red-500" : 
                problem.successRate < 60 ? "bg-gradient-to-r from-yellow-400 to-yellow-500" : 
                "bg-gradient-to-r from-green-400 to-green-500"
              }`}
              style={{ width: `${problem.successRate}%` }}
            />
          </div>
        </div>
        
        {/* Activity indicator */}
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{problem.views || 0} views</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>{problem.totalSolved || 0} solved</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Get content for the list view item
  const renderListItem = (problem, index) => (
    <motion.div
      key={problem._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ 
        scale: 1.01, 
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        transition: { duration: 0.2 }
      }}
      className="group bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={() => (window.location.href = `/problems/${problem._id}`)}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between relative">
        {/* Difficulty indicator bar */}
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
          problem.difficulty === "easy" ? "bg-gradient-to-b from-green-400 to-green-500" :
          problem.difficulty === "medium" ? "bg-gradient-to-b from-yellow-400 to-yellow-500" :
          "bg-gradient-to-b from-red-400 to-red-500"
        }`}></div>

        {/* Problem content */}
        <div className="flex-1 p-5 pl-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {getStatusBadge(problem._id, problem.premium)}
            <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getDifficultyBgColor(problem.difficulty)}`}>
              {getDifficultyIcon(problem.difficulty)}
              {problem.difficulty}
            </div>
            
            {/* Tags like new, featured */}
            {problem.isNew && (
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                NEW
              </div>
            )}
            {(!problem.isNew && problem.featured) && (
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                <Flame className="w-3 h-3" />
                HOT
              </div>
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {problem.title}
          </h3>
          
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <div className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 ${getCategoryBgColor(problem.category)}`}>
              {getCategoryIcon(problem.category)}
              <span>{problem.category.replace('-', ' ')}</span>
            </div>
            
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
              <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
              <span>Success Rate: {problem.successRate?.toFixed(1)}%</span>
            </div>
            
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
              <Eye className="w-3.5 h-3.5 text-purple-500" />
              <span>{problem.views || 0} views</span>
            </div>
          </div>
        </div>
        
        {/* Stats on the right */}
        <div className="flex flex-col items-end pr-5 py-5">
          <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-1">
            <div
              className={`h-full ${
                problem.successRate < 30 ? "bg-gradient-to-r from-red-400 to-red-500" : 
                problem.successRate < 60 ? "bg-gradient-to-r from-yellow-400 to-yellow-500" : 
                "bg-gradient-to-r from-green-400 to-green-500"
              }`}
              style={{ width: `${problem.successRate}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {problem.totalSubmissions || 0} attempts
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Animation variants for containers and items
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  // Get sorted problems with additional functionalities
  const getSortedProblems = () => {
    const sortedProblems = [...problems];
    switch (filters.sortBy) {
      case "newest":
        return sortedProblems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case "oldest":
        return sortedProblems.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case "most-solved":
        return sortedProblems.sort((a, b) => (b.totalSolved || 0) - (a.totalSolved || 0));
      case "least-solved":
        return sortedProblems.sort((a, b) => (a.totalSolved || 0) - (b.totalSolved || 0));
      case "difficulty-asc":
        return sortedProblems.sort((a, b) => getDifficultyLevel(a.difficulty) - getDifficultyLevel(b.difficulty));
      case "difficulty-desc":
        return sortedProblems.sort((a, b) => getDifficultyLevel(b.difficulty) - getDifficultyLevel(a.difficulty));
      case "success-rate":
        return sortedProblems.sort((a, b) => (b.successRate || 0) - (a.successRate || 0));
      default:
        return sortedProblems;
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 min-h-screen pb-20">
      {/* Header Section with Gradient & Stats */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="absolute inset-0 bg-[url(/grid-pattern.svg)] opacity-20"></div>
        
        {/* Blurred circles for visual flair */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-32 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-8"
          >
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Coding Challenges
              </h1>
              <p className="text-blue-100">
                Sharpen your problem-solving skills with our curated collection
              </p>
            </div>
            
            {user && (
              <div className="flex items-center gap-3 md:gap-5 flex-wrap">
                <motion.div 
                  className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md shadow-lg rounded-xl p-3 min-w-[120px] border border-white/20"
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <span className="text-3xl font-bold text-white">
                    {acceptedProblems.size}
                  </span>
                  <span className="text-xs text-blue-100">Problems Solved</span>
                </motion.div>
                
                <motion.div 
                  className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md shadow-lg rounded-xl p-3 min-w-[120px] border border-white/20"
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <span className="text-3xl font-bold text-white">
                    {Math.min(Math.round((acceptedProblems.size / (pagination.total || 1)) * 100), 100)}%
                  </span>
                  <span className="text-xs text-blue-100">Completion</span>
                </motion.div>
                
                {/* Streak card */}
                <motion.div 
                  className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md shadow-lg rounded-xl p-3 min-w-[120px] border border-white/20"
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="flex items-center">
                    <span className="text-3xl font-bold text-white mr-1">
                      5
                    </span>
                    <Zap size={18} className="text-yellow-300" />
                  </div>
                  <span className="text-xs text-blue-100">Day Streak</span>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar for filters and stats on larger screens */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              {/* Mobile Filter Toggle */}
              <div className="block lg:hidden">
                <motion.button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Filter className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {showFilters ? "Hide Filters" : "Show Filters"}
                  </span>
                </motion.button>
              </div>
              
              {/* Filter Section - Hidden on mobile unless toggled */}
              <AnimatePresence mode="wait">
                {(showFilters || typeof window !== 'undefined' && window.innerWidth >= 1024) && (
                  <motion.div 
                    className="space-y-5"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div 
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-5"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <motion.h3 
                        className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2"
                        variants={itemVariants}
                      >
                        <Filter className="w-5 h-5 text-blue-500" />
                        Filters
                      </motion.h3>
                      
                      <div className="space-y-6">
                        <motion.div variants={itemVariants}>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Difficulty
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {["Easy", "Medium", "Hard"].map((diff) => (
                              <button
                                key={diff}
                                onClick={() => setFilters(f => ({...f, difficulty: f.difficulty === diff.toLowerCase() ? "" : diff.toLowerCase(), page: 1}))}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                  filters.difficulty === diff.toLowerCase() 
                                    ? getDifficultyBgColor(diff)
                                    : "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                              >
                                {diff}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                        
                        <motion.div variants={itemVariants}>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Category
                          </label>
                          <div className="space-y-2">
                            {["Arrays", "Strings", "Linked-Lists", "Trees", "Dynamic-Programming"].map((cat) => (
                              <button
                                key={cat}
                                onClick={() => setFilters(f => ({...f, category: f.category === cat.toLowerCase() ? "" : cat.toLowerCase(), page: 1}))}
                                className={`flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                                  filters.category === cat.toLowerCase() 
                                    ? getCategoryBgColor(cat)
                                    : "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                              >
                                {getCategoryIcon(cat)}
                                <span className="ml-2">{cat.replace('-', ' ')}</span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                        
                        <motion.div variants={itemVariants}>
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
                            <option value="difficulty-asc">Difficulty (Easy to Hard)</option>
                            <option value="difficulty-desc">Difficulty (Hard to Easy)</option>
                            <option value="success-rate">Success Rate</option>
                          </select>
                        </motion.div>
                        
                        {/* Status filter for users */}
                        {user && (
                          <motion.div variants={itemVariants}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Status
                            </label>
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => setFilters(f => ({...f, status: f.status === 'solved' ? '' : 'solved', page: 1}))}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                  filters.status === 'solved'
                                    ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                                    : "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                              >
                                Solved
                              </button>
                              <button
                                onClick={() => setFilters(f => ({...f, status: f.status === 'unsolved' ? '' : 'unsolved', page: 1}))}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                  filters.status === 'unsolved'
                                    ? "bg-gray-200 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                                    : "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                              >
                                Unsolved
                              </button>
                            </div>
                          </motion.div>
                        )}
                        
                        <motion.button
                          variants={itemVariants}
                          onClick={resetFilters}
                          disabled={isFilterAnimating}
                          className="w-full flex items-center justify-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm font-medium"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <X className="w-4 h-4" />
                          Clear All Filters
                        </motion.button>
                      </div>
                    </motion.div>

                    {/* Premium upgrade card */}
                    {user && !user.premium && (
                      <motion.div 
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                      >
                        <div className="p-5 text-white">
                          <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                            <Crown className="w-5 h-5 text-yellow-300" />
                            AndCode Pro
                          </h3>
                          <p className="text-sm text-purple-100 mb-4">
                            Unlock premium problems and advanced analytics
                          </p>
                          <button className="w-full bg-white text-purple-700 font-medium py-2 px-4 rounded-lg hover:bg-purple-50 transition-colors flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Upgrade Now
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Main Problem List Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search Bar and View Toggle */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search problems by title or keywords..."
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 transition-all shadow-lg"
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
              
              {/* View toggle: Grid or List */}
              <div className="flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-lg">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-3 flex items-center gap-1 ${
                    viewMode === 'list' 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onMouseEnter={() => setShowTooltip('list')}
                  onMouseLeave={() => setShowTooltip('')}
                >
                  <div className="relative">
                    <ListFilter className="w-5 h-5" />
                    {showTooltip === 'list' && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                        List View
                      </div>
                    )}
                  </div>
                  <span className="hidden sm:inline">List</span>
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-3 flex items-center gap-1 ${
                    viewMode === 'grid' 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onMouseEnter={() => setShowTooltip('grid')}
                  onMouseLeave={() => setShowTooltip('')}
                >
                  <div className="relative">
                    <LayoutGrid className="w-5 h-5" />
                    {showTooltip === 'grid' && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                        Grid View
                      </div>
                    )}
                  </div>
                  <span className="hidden sm:inline">Grid</span>
                </button>
              </div>
            </motion.div>
            
            {/* Applied Filters Display */}
            <AnimatePresence>
              {(filters.difficulty || filters.category || filters.status) && (
                <motion.div 
                  className="flex flex-wrap gap-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {filters.difficulty && (
                    <motion.div 
                      className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getDifficultyBgColor(filters.difficulty)}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      {getDifficultyIcon(filters.difficulty)}
                      <span>{filters.difficulty.charAt(0).toUpperCase() + filters.difficulty.slice(1)}</span>
                      <button 
                        onClick={() => setFilters(f => ({...f, difficulty: ""}))}
                        className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  )}
                  
                  {filters.category && (
                    <motion.div 
                      className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getCategoryBgColor(filters.category)}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      {getCategoryIcon(filters.category)}
                      <span>{filters.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                      <button 
                        onClick={() => setFilters(f => ({...f, category: ""}))}
                        className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  )}
                  
                  {filters.status && (
                    <motion.div 
                      className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                        filters.status === 'solved' 
                          ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                          : "bg-gray-200 text-gray-800 border border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                      }`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      {filters.status === 'solved' ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <Timer className="w-3 h-3" />
                      )}
                      <span>{filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}</span>
                      <button 
                        onClick={() => setFilters(f => ({...f, status: ""}))}
                        className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Problem List */}
            {loading ? (
              <div className={`animate-pulse ${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}`}>
                {[...Array(viewMode === 'grid' ? 6 : 5)].map((_, i) => (
                  <div key={i} className={`${viewMode === 'grid' ? 'h-72' : 'h-24'} bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700`}>
                    <div className={`h-1.5 bg-gray-200 dark:bg-gray-700 rounded-t-xl`}></div>
                    <div className="p-4">
                      <div className="flex justify-between">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                      </div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full mt-4"></div>
                      {viewMode === 'grid' && (
                        <>
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-28 mt-6"></div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full mt-6"></div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <AnimatePresence mode="wait">
                  {getSortedProblems().length > 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-3'}
                    >
                      {getSortedProblems().map((problem, index) => (
                        viewMode === 'grid' 
                          ? renderGridItem(problem, index) 
                          : renderListItem(problem, index)
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                        <AlertCircle className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                        No problems found
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-6">
                        Try adjusting your filters or search terms to find what you're looking for
                      </p>
                      <button
                        onClick={resetFilters}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-colors inline-flex items-center gap-2 shadow-md hover:shadow-lg"
                      >
                        <X className="w-4 h-4" />
                        Clear Filters
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Pagination */}
                {getSortedProblems().length > 0 && (
                  <motion.div 
                    className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {((pagination.current - 1) * 10) + 1} -{' '}
                      {Math.min(pagination.current * 10, pagination.total)} of{' '}
                      {pagination.total} problems
                    </div>
                    
                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                        disabled={pagination.current === 1}
                        className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors shadow-md"
                        whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </motion.button>
                      <div className="flex items-center px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 shadow-md font-medium">
                        Page {pagination.current} of {pagination.pages}
                      </div>
                      <motion.button
                        onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                        disabled={pagination.current === pagination.pages}
                        className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors shadow-md"
                        whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}