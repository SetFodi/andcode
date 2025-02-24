import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  try {
    const { userId } = await params;

    if (!userId || typeof userId !== "string" || userId.length !== 24) {
      return NextResponse.json({ error: "Invalid User ID format" }, { status: 400 });
    }

    let objectId;
    try {
      objectId = new ObjectId(userId);
    } catch (err) {
      return NextResponse.json({ error: "Invalid User ID: must be a valid ObjectId" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("leetcode-clone");

    const user = await db.collection("users").findOne({ _id: objectId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Ensure all required fields are present
    const userData = {
      _id: user._id.toString(),
      username: user.username || "Unknown User",
      email: user.email || null,
      createdAt: user.createdAt || new Date().toISOString(),
      avatarUrl: user.avatarUrl || null,
    };

    console.log(`Fetched user data for ${userId}:`, userData);
    return NextResponse.json(userData, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Failed to fetch user", details: error.message }, { status: 500 });
  }
}