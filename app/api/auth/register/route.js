// app/api/auth/register/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { email, username, password } = await request.json();
    
    if (!email || !username || !password) {
      return NextResponse.json({ error: "Email, username, and password are required" }, { status: 400 });
    }
    
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db("leetcode-clone");
    
    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ 
      $or: [
        { email },
        { username }
      ]
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 });
      }
      if (existingUser.username === username) {
        return NextResponse.json({ error: "Username already taken" }, { status: 400 });
      }
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate a verification token
    const verificationToken = uuidv4();
    const now = new Date();
    const verificationTokenExpires = new Date(now);
    verificationTokenExpires.setHours(now.getHours() + 24); // Token valid for 24 hours
    
    // Create new user
    const newUser = {
      email,
      username,
      password: hashedPassword,
      isVerified: false, // User starts as unverified
      verificationToken,
      verificationTokenExpires,
      createdAt: now
    };
    
    const result = await db.collection("users").insertOne(newUser);
    
    // Generate a session token for auto-login (but with limited access until verified)
    const sessionToken = Buffer.from(`${result.insertedId}-${Date.now()}`).toString('base64');
    
    await db.collection("users").updateOne(
      { _id: result.insertedId },
      { $set: { sessionToken, lastActive: new Date() } }
    );
    
    // Send verification email
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://andcode.vercel.app'}/api/auth/verify-email?token=${verificationToken}`;
    
    // Set up nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT),
      secure: process.env.EMAIL_SERVER_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD
      }
    });
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@andcode.vercel.app',
      to: email,
      subject: 'Welcome to AndCode - Verify Your Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Welcome to AndCode!</h2>
          <p>Hello ${username},</p>
          <p>Thank you for signing up. To complete your registration and activate your account, please verify your email address:</p>
          <a href="${verificationUrl}" style="display: inline-block; background-color: #4f46e5; color: white; text-decoration: none; padding: 10px 20px; margin: 20px 0; border-radius: 5px;">Verify Email Address</a>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, you can safely ignore this email.</p>
          <p>Thanks,<br>The AndCode Team</p>
        </div>
      `
    };
    
    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      // Continue registration process even if email fails
    }
    
    // Set cookie for the session
    const cookieStore = require('next/headers').cookies();
    cookieStore.set("sessionToken", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 // 1 day
    });
    
    return NextResponse.json({
      userId: result.insertedId.toString(),
      token: sessionToken,
      isVerified: false,
      message: "Registration successful. Please check your email to verify your account."
    }, { status: 201 });
    
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}