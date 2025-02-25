"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ChevronUp, ChevronDown } from "lucide-react";

export default function Forum() {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newComments, setNewComments] = useState({});
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

  const handleVotePost = async (postId, voteType) => {
    if (!user) {
      setError("You must be logged in to vote.");
      return;
    }

    try {
      const response = await fetch(`/api/forum/posts/${postId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: user._id, voteType }),
      });
      if (!response.ok) throw new Error("Failed to vote on post");
      const updatedPost = await response.json();
      setPosts(posts.map((post) => (post._id === postId ? updatedPost : post)));
    } catch (err) {
      console.error("Error voting on post:", err);
      setError("Failed to vote on post.");
    }
  };

  const handleVoteComment = async (postId, commentId, voteType) => {
    if (!user) {
      setError("You must be logged in to vote.");
      return;
    }

    try {
      const response = await fetch(`/api/forum/posts/${postId}/comments/${commentId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: user._id, voteType }),
      });
      if (!response.ok) throw new Error("Failed to vote on comment");
      const updatedPost = await response.json();
      setPosts(posts.map((post) => (post._id === postId ? updatedPost : post)));
    } catch (err) {
      console.error("Error voting on comment:", err);
      setError("Failed to vote on comment.");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <h1 className="text-3xl font-bold mb-6">Forum</h1>

      {/* Create Post Form */}
      {user && (
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Create a New Post</h2>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <input
              type="text"
              placeholder="Post Title"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="What’s on your mind?"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="w-full p-3 h-32 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
            >
              Post
            </button>
          </form>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post._id} className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => handleVotePost(post._id, "upvote")}
                    className="text-gray-500 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
                    disabled={!user}
                  >
                    <ChevronUp className="w-6 h-6" />
                  </button>
                  <span className="text-sm font-medium">{post.upvotes - post.downvotes}</span>
                  <button
                    onClick={() => handleVotePost(post._id, "downvote")}
                    className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                    disabled={!user}
                  >
                    <ChevronDown className="w-6 h-6" />
                  </button>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{post.content}</p>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Posted by{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-300">{post.username}</span>{" "}
                    on {new Date(post.createdAt).toLocaleDateString()}
                  </div>

                  {/* Comments */}
                  <div className="mt-4 space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                    {post.comments && post.comments.length > 0 ? (
                      post.comments.map((comment) => (
                        <div key={comment._id} className="pl-4 border-l-2 border-gray-300 dark:border-gray-600 flex items-start gap-4">
                          <div className="flex flex-col items-center gap-2">
                            <button
                              onClick={() => handleVoteComment(post._id, comment._id, "upvote")}
                              className="text-gray-500 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
                              disabled={!user}
                            >
                              <ChevronUp className="w-5 h-5" />
                            </button>
                            <span className="text-xs font-medium">{comment.upvotes - comment.downvotes}</span>
                            <button
                              onClick={() => handleVoteComment(post._id, comment._id, "downvote")}
                              className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                              disabled={!user}
                            >
                              <ChevronDown className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              By {comment.username} on {new Date(comment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">No comments yet.</p>
                    )}

                    {/* Add Comment */}
                    {user && (
                      <div className="mt-4">
                        <textarea
                          placeholder="Add a comment..."
                          value={newComments[post._id] || ""}
                          onChange={(e) => setNewComments({ ...newComments, [post._id]: e.target.value })}
                          className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => handleAddComment(post._id)}
                          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                        >
                          Comment
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No posts yet. Be the first to start a discussion!
          </div>
        )}
      </div>
    </div>
  );
}