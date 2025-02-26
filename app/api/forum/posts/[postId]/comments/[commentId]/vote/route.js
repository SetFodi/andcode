import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request, { params }) {
  try {
<<<<<<< HEAD
    const { postId, commentId } = await params;
=======
    const { postId, commentId } = await params; // Await params
>>>>>>> 0d50bd7f23238a15e02de2ec2e5231515c422633
    const { userId, voteType } = await request.json();

    if (!ObjectId.isValid(postId) || !ObjectId.isValid(commentId) || !ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid postId, commentId, or userId" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("leetcode-clone");

    const post = await db.collection("forumPosts").findOne({ _id: new ObjectId(postId) });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const comment = post.comments.find(c => c._id.toString() === commentId);
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const upvoters = comment.upvoters || [];
    const downvoters = comment.downvoters || [];
    const hasUpvoted = upvoters.includes(userId);
    const hasDownvoted = downvoters.includes(userId);

    let update = {};
    if (voteType === "upvote") {
      if (hasUpvoted) {
        update = { $pull: { "comments.$.upvoters": userId }, $inc: { "comments.$.upvotes": -1 } };
      } else {
        update = { $addToSet: { "comments.$.upvoters": userId }, $inc: { "comments.$.upvotes": 1 } };
        if (hasDownvoted) {
          update.$pull = { "comments.$.downvoters": userId };
          update.$inc["comments.$.downvotes"] = -1;
        }
      }
    } else if (voteType === "downvote") {
      if (hasDownvoted) {
        update = { $pull: { "comments.$.downvoters": userId }, $inc: { "comments.$.downvotes": -1 } };
      } else {
        update = { $addToSet: { "comments.$.downvoters": userId }, $inc: { "comments.$.downvotes": 1 } };
        if (hasUpvoted) {
          update.$pull = { "comments.$.upvoters": userId };
          update.$inc["comments.$.upvotes"] = -1;
        }
      }
    } else if (voteType === "neutral") {
      update = {
        $pull: { "comments.$.upvoters": userId, "comments.$.downvoters": userId },
        $inc: { "comments.$.upvotes": hasUpvoted ? -1 : 0, "comments.$.downvotes": hasDownvoted ? -1 : 0 }
      };
    } else {
      return NextResponse.json({ error: "Invalid voteType" }, { status: 400 });
    }

    const result = await db.collection("forumPosts").findOneAndUpdate(
      { _id: new ObjectId(postId), "comments._id": new ObjectId(commentId) },
      update,
      { returnDocument: "after" }
    );

    if (!result.value) {
      return NextResponse.json({ error: "Failed to update comment" }, { status: 500 });
    }

    return NextResponse.json(result.value, { status: 200 });
  } catch (error) {
    console.error("Error voting on comment:", error);
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}