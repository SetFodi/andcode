import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db("leetcode-clone");

    const posts = await db
      .collection("forumPosts")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const formattedPosts = posts.map((post) => ({
      ...post,
      _id: post._id.toString(),
      userId: post.userId.toString(),
      comments: post.comments
        ? post.comments.map((comment) => ({
            ...comment,
            _id: comment._id.toString(),
            userId: comment.userId.toString(),
          }))
        : [],
    }));

    return NextResponse.json({ posts: formattedPosts }, { status: 200 });
  } catch (error) {
    console.error("Error fetching forum posts:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { title, content, userId, username } = await request.json();

    if (!title || !content || !userId || !username) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("leetcode-clone");

    const newPost = {
      title,
      content,
      userId: new ObjectId(userId),
      username,
      createdAt: new Date(),
      comments: [],
    };

    const result = await db.collection("forumPosts").insertOne(newPost);

    const createdPost = {
      ...newPost,
      _id: result.insertedId.toString(),
      userId: userId.toString(), // Return as string
    };

    return NextResponse.json(createdPost, { status: 201 });
  } catch (error) {
    console.error("Error creating forum post:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}