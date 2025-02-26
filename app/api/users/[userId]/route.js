import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  try {
    const { userId } = await params; // Await params

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

    const userData = {
      _id: user._id.toString(),
      username: user.username || "Unknown User",
      email: user.email || null,
      bio: user.bio || "",
      location: user.location || "",
      website: user.website || "",
      github: user.github || "",
      avatarUrl: user.avatarUrl || "",
      createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
      totalSubmissions: user.totalSubmissions || 0,
      successfulSubmissions: user.successfulSubmissions || 0
    };

    console.log(`Fetched user data for ${userId}:`, userData);
    return NextResponse.json(userData, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Failed to fetch user", details: error.message }, { status: 500 });
  }
}