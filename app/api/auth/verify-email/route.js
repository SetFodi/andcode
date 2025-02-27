// app/api/auth/verify-email/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json({ error: "Verification token is required" }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db("leetcode-clone");
    
    // Find user with the given verification token
    const user = await db.collection("users").findOne({ 
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() } // Token must not be expired
    });
    
    if (!user) {
      return new Response("Invalid or expired verification link. Please request a new one.", {
        status: 400,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }
    
    // Mark user as verified and remove verification token
    await db.collection("users").updateOne(
      { _id: user._id },
      { 
        $set: { 
          isVerified: true,
          emailVerifiedAt: new Date()
        },
        $unset: { 
          verificationToken: "",
          verificationTokenExpires: "" 
        }
      }
    );
    
    // Create HTML response for success
    const htmlResponse = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Email Verification Successful</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              text-align: center;
            }
            .container {
              background-color: #f9f9f9;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              margin-top: 50px;
            }
            h1 {
              color: #4f46e5;
              margin-bottom: 20px;
            }
            .icon {
              font-size: 64px;
              margin-bottom: 20px;
              color: #22c55e;
            }
            .button {
              display: inline-block;
              background-color: #4f46e5;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              margin-top: 20px;
              transition: background-color 0.3s;
            }
            .button:hover {
              background-color: #4338ca;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">✓</div>
            <h1>Email Verified Successfully!</h1>
            <p>Your email address has been verified. Your account is now active.</p>
            <p>You can now sign in to your account and access all features.</p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://andcode.vercel.app'}/auth/signin" class="button">Sign In Now</a>
          </div>
        </body>
      </html>
    `;
    
    return new Response(htmlResponse, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
    
  } catch (error) {
    console.error("Email verification error:", error);
    return new Response("An error occurred during verification. Please try again later.", {
      status: 500,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  }
}