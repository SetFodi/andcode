import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request, { params }) {
  try {
    const { postId } = params;
    const { content, userId, username } = await request.json();

    if (!content || !userId || !username) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("leetcode-clone");

    const newComment = {
      _id: new ObjectId(),
      content,
      userId: new ObjectId(userId),
      username,
      createdAt: new Date(),
      upvotes: 0, // Initialize vote counts
      downvotes: 0,
    };

    const result = await db.collection("forumPosts").findOneAndUpdate(
      { _id: new ObjectId(postId) },
      { $push: { comments: newComment } },
      { returnDocument: "after" }
    );

    if (!result.value) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const updatedPost = {
      ...result.value,
      _id: result.value._id.toString(),
      userId: result.value.userId.toString(),
      upvotes: result.value.upvotes || 0,
      downvotes: result.value.downvotes || 0,
      comments: result.value.comments.map((comment) => ({
        ...comment,
        _id: comment._id.toString(),
        userId: comment.userId.toString(),
        upvotes: comment.upvotes || 0,
        downvotes: comment.downvotes || 0,
      })),
    };

    return NextResponse.json(updatedPost, { status: 200 });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}