// app/api/users/[userId]/streak/route.js
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
    
    // Fetch user's activity to calculate streak
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(userId) },
      { projection: { currentStreak: 1, maxStreak: 1, lastActive: 1 } }
    );
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // If the user document has streak info, return it
    if (user.currentStreak !== undefined) {
      return NextResponse.json({
        currentStreak: user.currentStreak || 0,
        maxStreak: user.maxStreak || 0,
        lastActive: user.lastActive
      });
    }
    
    // Otherwise, calculate streak from submissions
    const submissions = await db.collection("submissions")
      .find({ userId: new ObjectId(userId) })
      .sort({ timestamp: -1 })
      .toArray();
    
    // Calculate streak based on daily activity
    let currentStreak = 0;
    let maxStreak = 0;
    
    if (submissions.length > 0) {
      // Get dates of submissions
      const activityDates = submissions.map(sub => {
        const date = new Date(sub.timestamp);
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      });
      
      // Get unique dates (a user may submit multiple times per day)
      const uniqueDates = [...new Set(activityDates)].sort();
      
      // Calculate current streak
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const todayStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
      const yesterdayStr = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`;
      
      // Check if active today or yesterday
      const activeToday = uniqueDates.includes(todayStr);
      const activeYesterday = uniqueDates.includes(yesterdayStr);
      
      if (activeToday || activeYesterday) {
        // Start counting streak
        currentStreak = 1;
        
        // Check previous days
        const lastActiveDate = activeToday ? new Date(todayStr) : new Date(yesterdayStr);
        let checkDate = new Date(lastActiveDate);
        checkDate.setDate(checkDate.getDate() - 1);
        
        while (true) {
          const checkDateStr = `${checkDate.getFullYear()}-${checkDate.getMonth() + 1}-${checkDate.getDate()}`;
          if (uniqueDates.includes(checkDateStr)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
      
      // Calculate max streak
      let tempStreak = 1;
      maxStreak = 1;
      
      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i - 1]);
        const currDate = new Date(uniqueDates[i]);
        
        const diffTime = Math.abs(currDate - prevDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          tempStreak++;
          maxStreak = Math.max(maxStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
      }
    }
    
    // Update user document with calculated streak
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          currentStreak: currentStreak,
          maxStreak: Math.max(maxStreak, currentStreak),
          lastActive: new Date()
        }
      }
    );
    
    return NextResponse.json({
      currentStreak: currentStreak,
      maxStreak: Math.max(maxStreak, currentStreak),
      lastActive: new Date()
    });
  } catch (error) {
    console.error("Failed to fetch streak:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}