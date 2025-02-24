"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { FiMessageSquare, FiUser, FiClock, FiAlertCircle } from "react-icons/fi";

export default function Forum() {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newComments, setNewComments] = useState({}); // Store new comment input per post
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/forum/posts", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch posts");
      const data = await response.json();
      setPosts(data.posts || []);
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
      setPosts([newPost, ...posts]);
      setNewPostTitle("");
      setNewPostContent("");
      setError("");
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
      setPosts(posts.map((post) => (post._id === postId ? updatedPost : post)));
      setNewComments({ ...newComments, [postId]: "" });
      setError("");
    } catch (err) {
      console.error("Error adding comment:", err);
      setError("Failed to add comment.");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-blue-500 rounded-full animate-bounce"></div>
          <span className="text-gray-600 dark:text-gray-400">Loading forum...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Community Forum
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Join the discussion and share your thoughts
        </p>
      </div>

      {/* Create Post Form */}
      {user && (
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
            <FiMessageSquare className="w-5 h-5 text-blue-500" />
            Create New Post
          </h2>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <input
              type="text"
              placeholder="Post Title"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <textarea
              placeholder="What’s on your mind?"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="w-full px-4 py-3 h-32 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:scale-[1.02] transition-transform duration-200 shadow-md"
              >
                Publish Post
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30">
          <FiAlertCircle className="flex-shrink-0 w-5 h-5" />
          {error}
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div 
              key={post._id} 
              className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  <FiUser className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                    <span>@{post.username}</span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <FiClock className="w-4 h-4" />
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-6 ml-2 pl-8 border-l-2 border-gray-200 dark:border-gray-700">
                {post.content}
              </p>

              {/* Comments */}
              <div className="mt-6 space-y-6 border-t border-gray-100 dark:border-gray-700 pt-6">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FiMessageSquare className="w-5 h-5 text-blue-500" />
                  {post.comments?.length || 0} Comments
                </h4>

                {post.comments && post.comments.length > 0 ? (
                  post.comments.map((comment) => (
                    <div 
                      key={comment._id} 
                      className="pl-6 ml-4 border-l-2 border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-white text-sm">
                          <FiUser className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-700 dark:text-gray-300">
                            {comment.content}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <span>@{comment.username}</span>
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No comments yet. Be the first to share your thoughts!
                  </p>
                )}

                {/* Add Comment */}
                {user && (
                  <div className="mt-6 pl-6 ml-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-white">
                        <FiUser className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <textarea
                          placeholder="Write a comment..."
                          value={newComments[post._id] || ""}
                          onChange={(e) => setNewComments({ ...newComments, [post._id]: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          rows="2"
                        />
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={() => handleAddComment(post._id)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm hover:scale-[1.02] transition-transform"
                          >
                            Post Comment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow">
            <div className="text-gray-500 dark:text-gray-400 mb-4 text-6xl">💬</div>
            <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2">
              No discussions yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Start the conversation by creating the first post!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}