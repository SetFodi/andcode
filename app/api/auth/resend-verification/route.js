// app/api/auth/resend-verification/route.js
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
    
    // Check if user exists and is not already verified
    const user = await db.collection("users").findOne({ 
      email,
      $or: [
        { isVerified: { $exists: false } },
        { isVerified: false }
      ]
    });
    
    // If user doesn't exist or is already verified, don't reveal this information
    if (!user) {
      return NextResponse.json({ 
        message: "If your email is in our system and not verified, you will receive a verification link shortly."
      });
    }
    
    // Generate a verification token
    const verificationToken = uuidv4();
    const verificationTokenExpires = new Date();
    verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24); // Token valid for 24 hours
    
    // Save the verification token to the user's record
    await db.collection("users").updateOne(
      { _id: user._id },
      { 
        $set: { 
          verificationToken, 
          verificationTokenExpires 
        } 
      }
    );
    
    // Send email with verification link
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
      to: user.email,
      subject: 'Verify Your AndCode Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Verify Your Email Address</h2>
          <p>Hello ${user.username},</p>
          <p>Thank you for signing up for AndCode. Please click the button below to verify your email address:</p>
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
      // Don't reveal the email error to the client
    }
    
    return NextResponse.json({ 
      message: "If your email is in our system and not verified, you will receive a verification link shortly."
    });
    
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}