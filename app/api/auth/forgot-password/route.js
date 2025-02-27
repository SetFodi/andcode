// app/api/auth/forgot-password/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db("leetcode-clone");
    
    // Check if user exists
    const user = await db.collection("users").findOne({ email });
    
    // We don't want to reveal whether a user exists or not for security reasons
    // So we'll return a success message regardless
    if (!user) {
      return NextResponse.json({ 
        message: "If your email is in our system, you will receive a password reset link shortly."
      });
    }
    
    // Generate a reset token
    const resetToken = uuidv4();
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1); // Token valid for 1 hour
    
    // Save the reset token to the user's record
    await db.collection("users").updateOne(
      { _id: user._id },
      { 
        $set: { 
          resetToken, 
          resetTokenExpires 
        } 
      }
    );
    
    // Send email with reset link
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://andcode.vercel.app'}/auth/reset-password?token=${resetToken}`;
    
    // Set up nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      secure: process.env.EMAIL_SERVER_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD
      }
    });
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@andcode.vercel.app',
      to: user.email,
      subject: 'AndCode Password Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Reset Your Password</h2>
          <p>Hello ${user.username},</p>
          <p>We received a request to reset your password. Click the button below to create a new password. This link is valid for 1 hour.</p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #4f46e5; color: white; text-decoration: none; padding: 10px 20px; margin: 20px 0; border-radius: 5px;">Reset Password</a>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          <p>Thanks,<br>The AndCode Team</p>
        </div>
      `
    };
    
    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Don't reveal the email error to the client
    }
    
    return NextResponse.json({ 
      message: "If your email is in our system, you will receive a password reset link shortly."
    });
    
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}