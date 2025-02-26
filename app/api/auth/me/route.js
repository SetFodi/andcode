// app/api/auth/me/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get("sessionToken")?.value;
    
    console.log("Auth/me: Session token received:", sessionToken);
    
    if (!sessionToken) {
      console.log("Auth/me: No session token provided");
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    
    const client = await clientPromise;
    const db = client.db("leetcode-clone");
    
    const user = await db.collection("users").findOne({ sessionToken });
    if (!user) {
      console.log("Auth/me: No user found for session token");
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    
    console.log("Auth/me: User found for session:", user._id);
    
    return NextResponse.json({
      authenticated: true,
      user: {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl || "",
      }
    });
  } catch (error) {
    console.error("Auth/me error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}