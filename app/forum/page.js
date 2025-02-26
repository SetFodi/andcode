"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { 
  ChevronUp, 
  ChevronDown, 
  MessageCircle, 
  Clock, 
  User, 
  Send, 
  Edit,
  Calendar, 
  Award,
  TrendingUp,
  X,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Forum() {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newComments, setNewComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [expandedComments, setExpandedComments] = useState({});
  const [showNewPostForm, setShowNewPostForm] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/forum/posts", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch posts");
      const data = await response.json();
      // Normalize posts and comments fully
      const normalizedPosts = (data.posts || []).map(post => ({
        ...post,
        upvoters: post.upvoters || [],
        downvoters: post.downvoters || [],
        comments: (post.comments || []).map(comment => ({
          ...comment,
          upvoters: comment.upvoters || [],
          downvoters: comment.downvoters || [],
        })),
      }));
      setPosts(normalizedPosts);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load forum posts.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to create a post.");
      return;
    }
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      setError("Title and content are required.");
      return;
    }

    try {
      const response = await fetch("/api/forum/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: newPostTitle,
          content: newPostContent,
          userId: user._id,
          username: user.username,
        }),
      });
      if (!response.ok) throw new Error("Failed to create post");
      const newPost = await response.json();
      setPosts([{ ...newPost, upvoters: newPost.upvoters || [], downvoters: newPost.downvoters || [], comments: (newPost.comments || []).map(c => ({ ...c, upvoters: c.upvoters || [], downvoters: c.downvoters || [] })) }, ...posts]);
      setNewPostTitle("");
      setNewPostContent("");
      setError("");
      setShowNewPostForm(false);
    } catch (err) {
      console.error("Error creating post:", err);
      setError("Failed to create post.");
    }
  };

  const handleAddComment = async (postId) => {
    if (!user) {
      setError("You must be logged in to comment.");
      return;
    }
    const commentContent = newComments[postId]?.trim();
    if (!commentContent) {
      setError("Comment content is required.");
      return;
    }

    try {
      const response = await fetch(`/api/forum/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          content: commentContent,
          userId: user._id,
          username: user.username,
        }),
      });
      if (!response.ok) throw new Error("Failed to add comment");
      const updatedPost = await response.json();
      setPosts(posts.map((post) => (post._id === postId ? { ...updatedPost, upvoters: updatedPost.upvoters || [], downvoters: updatedPost.downvoters || [], comments: (updatedPost.comments || []).map(c => ({ ...c, upvoters: c.upvoters || [], downvoters: c.downvoters || [] })) } : post)));
      setNewComments({ ...newComments, [postId]: "" });
      setError("");
      
      // Auto-expand comments when user adds a new one
      setExpandedComments({
        ...expandedComments,
        [postId]: true
      });
    } catch (err) {
      console.error("Error adding comment:", err);
      setError("Failed to add comment.");
    }
  };

  const handleVotePost = async (postId, voteType) => {
    if (!user) {
      setError("You must be logged in to vote.");
      return;
    }

    try {
      const post = posts.find((p) => p._id === postId);
      const hasUpvoted = post.upvoters.includes(user._id);
      const hasDownvoted = post.downvoters.includes(user._id);
      const newVoteType = hasUpvoted && voteType === "upvote" ? "neutral" :
                         hasDownvoted && voteType === "downvote" ? "neutral" :
                         voteType;

      const response = await fetch(`/api/forum/posts/${postId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: user._id, voteType: newVoteType }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to vote on post");
        return;
      }
      setPosts(posts.map((post) => (post._id === postId ? { ...data, upvoters: data.upvoters || [], downvoters: data.downvoters || [], comments: (data.comments || []).map(c => ({ ...c, upvoters: c.upvoters || [], downvoters: c.downvoters || [] })) } : post)));
      setError("");
    } catch (err) {
      console.error("Error voting on post:", err);
      setError("Failed to vote on post due to a network error.");
    }
  };

  const handleVoteComment = async (postId, commentId, voteType) => {
    if (!user) {
      setError("You must be logged in to vote.");
      return;
    }

    try {
      const post = posts.find((p) => p._id === postId);
      const comment = post.comments.find((c) => c._id === commentId);
      const hasUpvoted = comment.upvoters.includes(user._id);
      const hasDownvoted = comment.downvoters.includes(user._id);
      const newVoteType = hasUpvoted && voteType === "upvote" ? "neutral" :
                         hasDownvoted && voteType === "downvote" ? "neutral" :
                         voteType;

      const response = await fetch(`/api/forum/posts/${postId}/comments/${commentId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: user._id, voteType: newVoteType }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to vote on comment");
        return;
      }
      setPosts(posts.map((post) => (post._id === postId ? { ...data, upvoters: data.upvoters || [], downvoters: data.downvoters || [], comments: (data.comments || []).map(c => ({ ...c, upvoters: c.upvoters || [], downvoters: c.downvoters || [] })) } : post)));
      setError("");
    } catch (err) {
      console.error("Error voting on comment:", err);
      setError("Failed to vote on comment due to a network error.");
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments({
      ...expandedComments,
      [postId]: !expandedComments[postId]
    });
  };

  const getSortedPosts = () => {
    const sortedPosts = [...posts];
    switch (sortBy) {
      case "newest":
        return sortedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case "oldest":
        return sortedPosts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case "votes":
        return sortedPosts.sort((a, b) => 
          ((b.upvotes || 0) - (b.downvotes || 0)) - ((a.upvotes || 0) - (a.downvotes || 0))
        );
      case "comments":
        return sortedPosts.sort((a, b) => 
          (b.comments?.length || 0) - (a.comments?.length || 0)
        );
      default:
        return sortedPosts;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getVoteCount = (upvotes, downvotes) => {
    return (upvotes || 0) - (downvotes || 0);
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-blue-600 dark:text-blue-400 font-medium">Loading forum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Community Forum
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Join the conversation. Share ideas. Get help.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative inline-block">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg pl-4 pr-10 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="votes">Most Votes</option>
              <option value="comments">Most Comments</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-600 dark:text-gray-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
          
          {user && (
            <button
              onClick={() => setShowNewPostForm(!showNewPostForm)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              {showNewPostForm ? (
                <>
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4" />
                  <span>New Post</span>
                </>
              )}
            </button>
          )}
        </div>
      </header>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 text-red-700 dark:text-red-400"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNewPostForm && user && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-500" />
                Create a New Post
              </h2>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <label htmlFor="post-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input
                    id="post-title"
                    type="text"
                    placeholder="What's your topic?"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="post-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
                  <textarea
                    id="post-content"
                    placeholder="Share your thoughts, questions, or insights..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="w-full p-3 h-32 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Publish Post
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {getSortedPosts().length > 0 ? (
          getSortedPosts().map((post) => (
            <motion.div 
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-1 bg-gray-50 dark:bg-gray-900 p-2 rounded-lg">
                  <button
                    onClick={() => handleVotePost(post._id, "upvote")}
                    className={`p-1 rounded-md transition-colors ${
                      post.upvoters.includes(user?._id)
                        ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" 
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    disabled={!user}
                    title={user ? "Upvote" : "Log in to vote"}
                  >
                    <ChevronUp className="w-6 h-6" />
                  </button>
                  <span className={`text-sm font-bold ${
                    getVoteCount(post.upvotes, post.downvotes) > 0 
                      ? "text-green-600 dark:text-green-400" 
                      : getVoteCount(post.upvotes, post.downvotes) < 0 
                        ? "text-red-600 dark:text-red-400" 
                        : "text-gray-600 dark:text-gray-400"
                  }`}>
                    {getVoteCount(post.upvotes, post.downvotes)}
                  </span>
                  <button
                    onClick={() => handleVotePost(post._id, "downvote")}
                    className={`p-1 rounded-md transition-colors ${
                      post.downvoters.includes(user?._id) 
                        ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" 
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    disabled={!user}
                    title={user ? "Downvote" : "Log in to vote"}
                  >
                    <ChevronDown className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{post.title || "Untitled"}</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-line">{post.content || ""}</p>
                  
                  <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{post.username || "Unknown"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{post.createdAt ? formatDate(post.createdAt) : "Unknown date"}</span>
                    </div>
                    <button 
                      onClick={() => toggleComments(post._id)}
                      className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>
                        {post.comments?.length || 0} 
                        {post.comments?.length === 1 ? " comment" : " comments"}
                      </span>
                    </button>
                  </div>

                  <AnimatePresence>
                    {(expandedComments[post._id] || post.comments?.length === 0) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-4 space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700 overflow-hidden"
                      >
                        {post.comments && post.comments.length > 0 ? (
                          post.comments.map((comment) => (
                            <div 
                              key={comment._id} 
                              className="pl-4 border-l-2 border-blue-300 dark:border-blue-700 flex items-start gap-4 py-3 px-4 bg-gray-50 dark:bg-gray-850 rounded-lg"
                            >
                              <div className="flex flex-col items-center gap-1">
                                <button
                                  onClick={() => handleVoteComment(post._id, comment._id, "upvote")}
                                  className={`p-1 rounded-full transition-colors ${
                                    comment.upvoters.includes(user?._id) 
                                      ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" 
                                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  }`}
                                  disabled={!user}
                                  title={user ? "Upvote" : "Log in to vote"}
                                >
                                  <ChevronUp className="w-4 h-4" />
                                </button>
                                <span className={`text-xs font-bold ${
                                  getVoteCount(comment.upvotes, comment.downvotes) > 0 
                                    ? "text-green-600 dark:text-green-400" 
                                    : getVoteCount(comment.upvotes, comment.downvotes) < 0 
                                      ? "text-red-600 dark:text-red-400" 
                                      : "text-gray-600 dark:text-gray-400"
                                }`}>
                                  {getVoteCount(comment.upvotes, comment.downvotes)}
                                </span>
                                <button
                                  onClick={() => handleVoteComment(post._id, comment._id, "downvote")}
                                  className={`p-1 rounded-full transition-colors ${
                                    comment.downvoters.includes(user?._id) 
                                      ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" 
                                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  }`}
                                  disabled={!user}
                                  title={user ? "Downvote" : "Log in to vote"}
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="flex-1">
                                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">{comment.content || ""}</p>
                                <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                  <div className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    <span>{comment.username || "Unknown"}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{comment.createdAt ? formatDate(comment.createdAt) : "Unknown date"}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p>No comments yet. Start the conversation!</p>
                          </div>
                        )}

                        {user && (
                          <div className="mt-4 bg-gray-50 dark:bg-gray-850 p-4 rounded-lg">
                            <label htmlFor={`comment-${post._id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Add your thoughts
                            </label>
                            <div className="flex gap-2">
                              <textarea
                                id={`comment-${post._id}`}
                                placeholder="Write a comment..."
                                value={newComments[post._id] || ""}
                                onChange={(e) => setNewComments({ ...newComments, [post._id]: e.target.value })}
                                className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                                rows={2}
                              />
                              <button
                                onClick={() => handleAddComment(post._id)}
                                className="self-end px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                disabled={!newComments[post._id]?.trim()}
                              >
                                <Send className="w-4 h-4" />
                                <span>Post</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700">
            <Award className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No posts yet</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
              Be the first to start a discussion in our community!
            </p>
            {user ? (
              <button
                onClick={() => setShowNewPostForm(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Create a Post
              </button>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                Sign in to create a post and join the conversation.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}