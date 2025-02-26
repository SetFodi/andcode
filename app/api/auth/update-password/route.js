// app/api/auth/update-password/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db("leetcode-clone");
    const { currentPassword, newPassword } = await request.json();

    // Mock user ID and password check (replace with real auth)
    const userId = new ObjectId("your-user-id-here"); // Replace with real logic
    const user = await db.collection("users").findOne({ _id: userId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Mock password check (replace with real verification, e.g., bcrypt)
    if (currentPassword !== "testpassword") { // Example condition
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
    }

    const result = await db.collection("users").updateOne(
      { _id: userId },
      { $set: { password: newPassword, updatedAt: new Date() } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
    }

    return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}