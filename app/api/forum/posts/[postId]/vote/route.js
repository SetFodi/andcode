import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request, { params }) {
  try {
    const { postId } = await params; // Await params in Next.js 15
    const { userId, voteType } = await request.json();

    if (!ObjectId.isValid(postId) || !ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid postId or userId" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("leetcode-clone");

    const post = await db.collection("forumPosts").findOne({ _id: new ObjectId(postId) });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const upvoters = post.upvoters || [];
    const downvoters = post.downvoters || [];
    const hasUpvoted = upvoters.includes(userId);
    const hasDownvoted = downvoters.includes(userId);

    let update = {};
    if (voteType === "upvote") {
      if (hasUpvoted) {
        update = { $pull: { upvoters: userId }, $inc: { upvotes: -1 } };
      } else {
        update = { $addToSet: { upvoters: userId }, $inc: { upvotes: 1 } };
        if (hasDownvoted) {
          update.$pull = { downvoters: userId };
          update.$inc.downvotes = -1;
        }
      }
    } else if (voteType === "downvote") {
      if (hasDownvoted) {
        update = { $pull: { downvoters: userId }, $inc: { downvotes: -1 } };
      } else {
        update = { $addToSet: { downvoters: userId }, $inc: { downvotes: 1 } };
        if (hasUpvoted) {
          update.$pull = { upvoters: userId };
          update.$inc.upvotes = -1;
        }
      }
    } else if (voteType === "neutral") {
      update = {
        $pull: { upvoters: userId, downvoters: userId },
        $inc: { upvotes: hasUpvoted ? -1 : 0, downvotes: hasDownvoted ? -1 : 0 }
      };
    } else {
      return NextResponse.json({ error: "Invalid voteType" }, { status: 400 });
    }

    const result = await db.collection("forumPosts").findOneAndUpdate(
      { _id: new ObjectId(postId) },
      update,
      { returnDocument: "after" }
    );

    if (!result.value) {
      return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
    }

    return NextResponse.json(result.value, { status: 200 });
  } catch (error) {
    console.error("Error voting on post:", error);
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}