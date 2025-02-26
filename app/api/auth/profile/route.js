// app/api/auth/profile/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PUT(request) {
  try {
    const client = await clientPromise;
    const db = client.db("leetcode-clone");
    const profileData = await request.json();

    // Mock user ID (replace with actual session-based ID)
    const userId = new ObjectId("your-user-id-here"); // Replace with real logic

    const result = await db.collection("users").findOneAndUpdate(
      { _id: userId },
      { 
        $set: { 
          username: profileData.username,
          email: profileData.email,
          bio: profileData.bio,
          location: profileData.location,
          website: profileData.website,
          github: profileData.github,
          avatarUrl: profileData.avatarUrl,
          updatedAt: new Date()
        }
      },
      { returnDocument: "after" }
    );

    if (!result.value) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      _id: result.value._id.toString(),
      username: result.value.username,
      email: result.value.email,
      bio: result.value.bio || "",
      location: result.value.location || "",
      website: result.value.website || "",
      github: result.value.github || "",
      avatarUrl: result.value.avatarUrl || ""
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}