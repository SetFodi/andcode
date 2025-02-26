// app/api/forum/posts/[postId]/comments/[commentId]/vote/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request, context) {
  try {
    const { postId, commentId } = await context.params;
    const { userId, voteType } = await request.json();

    // Require authentication
    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Login required with valid userId" }, { status: 401 });
    }

    // Validate voteType
    if (!["upvote", "downvote", "neutral"].includes(voteType)) {
      return NextResponse.json({ error: "Invalid voteType" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("leetcode-clone");

    const post = await db.collection("forumPosts").findOne({
      _id: new ObjectId(postId),
      "comments._id": new ObjectId(commentId),
    });

    if (!post) {
      return NextResponse.json({ error: "Post or comment not found" }, { status: 404 });
    }

    const comment = post.comments.find((c) => c._id.toString() === commentId);
    const upvoters = comment.upvoters || [];
    const downvoters = comment.downvoters || [];
    const userObjectId = new ObjectId(userId);

    const hasUpvoted = upvoters.some((voter) => voter.toString() === userObjectId.toString());
    const hasDownvoted = downvoters.some((voter) => voter.toString() === userObjectId.toString());

    // Prepare update operations
    let updateQuery = {};

    // Remove existing vote if present
    if (hasUpvoted) {
      updateQuery.$pull = { "comments.$.upvoters": userObjectId };
      updateQuery.$inc = { "comments.$.upvotes": -1 };
    } else if (hasDownvoted) {
      updateQuery.$pull = { "comments.$.downvoters": userObjectId };
      updateQuery.$inc = { "comments.$.downvotes": -1 };
    }

    // Apply new vote if not neutral
    if (voteType === "upvote") {
      updateQuery.$push = { "comments.$.upvoters": userObjectId };
      updateQuery.$inc = updateQuery.$inc || {};
      updateQuery.$inc["comments.$.upvotes"] = (updateQuery.$inc["comments.$.upvotes"] || 0) + 1;
    } else if (voteType === "downvote") {
      updateQuery.$push = { "comments.$.downvoters": userObjectId };
      updateQuery.$inc = updateQuery.$inc || {};
      updateQuery.$inc["comments.$.downvotes"] = (updateQuery.$inc["comments.$.downvotes"] || 0) + 1;
    }

    // If no changes needed, return current state
    if (Object.keys(updateQuery).length === 0) {
      return NextResponse.json(post, { status: 200 });
    }

    const result = await db.collection("forumPosts").findOneAndUpdate(
      { _id: new ObjectId(postId), "comments._id": new ObjectId(commentId) },
      updateQuery,
      { returnDocument: "after" }
    );

    if (!result.value) {
      return NextResponse.json({ error: "Failed to update comment" }, { status: 500 });
    }

    const updatedPost = {
      ...result.value,
      _id: result.value._id.toString(),
      userId: result.value.userId.toString(),
      upvotes: result.value.upvotes || 0,
      downvotes: result.value.downvotes || 0,
      upvoters: (result.value.upvoters || []).map((id) => id.toString()),
      downvoters: (result.value.downvoters || []).map((id) => id.toString()),
      comments: result.value.comments.map((comment) => ({
        ...comment,
        _id: comment._id.toString(),
        userId: comment.userId.toString(),
        upvotes: comment.upvotes || 0,
        downvotes: comment.downvotes || 0,
        upvoters: (comment.upvoters || []).map((id) => id.toString()),
        downvoters: (comment.downvoters || []).map((id) => id.toString()),
      })),
    };

    return NextResponse.json(updatedPost, { status: 200 });
  } catch (error) {
    console.error("Error voting on comment:", error);
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}