// app/api/users/[userId]/submissions/route.js
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
    
    // Build query with the userId
    const query = { userId: new ObjectId(userId) };
    
    // Fetch submissions
    const submissions = await db
      .collection("submissions")
      .find(query)
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();
    
    // Get problem titles for submissions
    const problemIds = submissions.map(s => s.problemId).filter(id => id);
    const problemsMap = {};
    
    if (problemIds.length > 0) {
      const problems = await db
        .collection("problems")
        .find({ _id: { $in: problemIds.map(id => new ObjectId(id)) } })
        .project({ _id: 1, title: 1, difficulty: 1 })
        .toArray();
      
      problems.forEach(problem => {
        problemsMap[problem._id.toString()] = {
          title: problem.title,
          difficulty: problem.difficulty
        };
      });
    }
    
    // Add problem titles and difficulty to submissions
    const enhancedSubmissions = submissions.map(submission => {
      const problemId = submission.problemId ? submission.problemId.toString() : null;
      const problem = problemId ? problemsMap[problemId] : null;
      
      return {
        ...submission,
        problemId: problemId,
        problemTitle: problem ? problem.title : 'Unknown Problem',
        difficulty: problem ? problem.difficulty : null
      };
    });
    
    return NextResponse.json(enhancedSubmissions);
  } catch (error) {
    console.error("Failed to fetch submissions:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}