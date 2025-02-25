import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request, context) {
  try {
    const { params } = context;
    const { postId } = await params; // Await params to resolve the Promise
    const { userId, voteType } = await request.json(); // voteType: "upvote" or "downvote"

    if (!userId || !["upvote", "downvote"].includes(voteType)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("leetcode-clone");

    const updateField = voteType === "upvote" ? "upvotes" : "downvotes";
    const result = await db.collection("forumPosts").findOneAndUpdate(
      { _id: new ObjectId(postId) },
      { $inc: { [updateField]: 1 } },
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
    console.error("Error voting on post:", error);
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}