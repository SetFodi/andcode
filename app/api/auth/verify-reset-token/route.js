// app/api/auth/verify-reset-token/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db("leetcode-clone");
    
    // Find user with the given reset token
    const user = await db.collection("users").findOne({ 
      resetToken: token,
      resetTokenExpires: { $gt: new Date() } // Token must not be expired
    });
    
    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }
    
    return NextResponse.json({ valid: true });
    
  } catch (error) {
    console.error("Verify reset token error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}