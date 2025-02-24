// app/api/users/[userId]/route.js
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
    
    // Fetch user data
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } } // Exclude password field
    );
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Calculate user statistics
    // 1. Get total submissions and accepted submissions
    const submissionStats = await db.collection("submissions").aggregate([
      { $match: { userId: new ObjectId(userId) } },
      { $group: {
          _id: null,
          total: { $sum: 1 },
          accepted: { 
            $sum: { $cond: [{ $eq: ["$status", "ACCEPTED"] }, 1, 0] }
          }
        }
      }
    ]).toArray();
    
    // 2. Get unique solved problems count
    const solvedProblems = await db.collection("submissions").aggregate([
      { 
        $match: { 
          userId: new ObjectId(userId),
          status: "ACCEPTED"
        } 
      },
      { $group: { _id: "$problemId" } },
      { $count: "total" }
    ]).toArray();
    
    // 3. Calculate user ranking (optional - can be complex)
    // This is a simplified version - you might want a more sophisticated ranking system
    const userRanking = await db.collection("users").countDocuments({
      totalSolvedProblems: { $gt: user.totalSolvedProblems || 0 }
    });
    
    // Combine all data
    const enhancedUser = {
      ...user,
      stats: {
        totalSubmissions: submissionStats[0]?.total || 0,
        acceptedSubmissions: submissionStats[0]?.accepted || 0,
        totalSolvedProblems: solvedProblems[0]?.total || 0,
        successRate: submissionStats[0]?.total ? 
          ((submissionStats[0]?.accepted / submissionStats[0]?.total) * 100).toFixed(1) : 0,
        ranking: userRanking + 1 // +1 since countDocuments returns users with greater count
      }
    };
    
    return NextResponse.json(enhancedUser);
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}