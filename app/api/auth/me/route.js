import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("sessionToken")?.value;

    if (!sessionToken) {
      console.log("No session token found in cookies");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("leetcode-clone");

    const user = await db.collection("users").findOne({ sessionToken });
    if (!user) {
      console.log("No user found for session token:", sessionToken);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("User found for session:", user._id.toString());
    return NextResponse.json({
      user: {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
        github: user.github || "",
        avatarUrl: user.avatarUrl || ""
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error in /api/auth/me:", error);
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}