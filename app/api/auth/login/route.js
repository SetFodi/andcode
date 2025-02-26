// app/api/auth/login/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const client = await clientPromise;
    const db = client.db("leetcode-clone");

    const user = await db.collection("users").findOne({ email });
    if (!user) {
      console.log("User not found for email:", email);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.log("Password mismatch for email:", email);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const sessionToken = Buffer.from(`${user._id}-${Date.now()}`).toString('base64');
    await db.collection("users").updateOne(
      { _id: user._id },
      { $set: { sessionToken, lastActive: new Date() } }
    );

    const cookieStore = await cookies();
    cookieStore.set("sessionToken", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    console.log("Login successful, sessionToken set:", sessionToken);
    return NextResponse.json({
      user: {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl || "",
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}