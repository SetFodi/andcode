// app/api/users/[userId]/badges/route.js
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from "@/lib/mongodb";
import jwt from 'jsonwebtoken';

// Helper function to verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export async function GET(request, { params }) {
  try {
    const { userId } = params;
    
    // Verify authentication
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("leetcode-clone");
    
    // Fetch user badges
    const badges = await db.collection("badges")
      .find({ userId: new ObjectId(userId) })
      .sort({ earnedAt: -1 })
      .toArray();
    
    return NextResponse.json(badges);
  } catch (error) {
    console.error("Failed to fetch badges:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}