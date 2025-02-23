'use client'
import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProblemsList() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    difficulty: '',
    category: '',
    search: '',
    page: 1
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    current: 1
  });

  useEffect(() => {
    fetchProblems();
  }, [filters]);

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
      console.error('Failed to fetch problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Coding Problems</h1>
        
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search problems..."
                className="w-full pl-10 pr-4 py-2 border rounded"
                value={filters.search}
                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
              />
            </div>
          </div>
          
          <select
            className="border rounded px-4 py-2"
            value={filters.difficulty}
            onChange={(e) => setFilters(f => ({ ...f, difficulty: e.target.value, page: 1 }))}
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          
          <select
            className="border rounded px-4 py-2"
            value={filters.category}
            onChange={(e) => setFilters(f => ({ ...f, category: e.target.value, page: 1 }))}
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
        <div className="text-center py-8">Loading problems...</div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Success Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {problems.map((problem) => (
                  <tr
                    key={problem._id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => window.location.href = `/problems/${problem._id}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="h-3 w-3 rounded-full bg-gray-300 inline-block"></span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{problem.title}</div>
                      <div className="text-sm text-gray-500">{problem.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`${getDifficultyColor(problem.difficulty)} text-sm font-medium`}>
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {problem.successRate?.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-700">
              Showing {(pagination.current - 1) * 10 + 1} to{' '}
              {Math.min(pagination.current * 10, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                disabled={pagination.current === 1}
                className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                disabled={pagination.current === pagination.pages}
                className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}