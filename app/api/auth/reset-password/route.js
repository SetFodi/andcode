// app/api/auth/reset-password/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { token, password } = await request.json();
    
    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
    }
    
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
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
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update the user's password and remove reset token
    await db.collection("users").updateOne(
      { _id: user._id },
      { 
        $set: { password: hashedPassword },
        $unset: { resetToken: "", resetTokenExpires: "" }
      }
    );
    
    return NextResponse.json({ 
      message: "Password has been reset successfully" 
    });
    
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}