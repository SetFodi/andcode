// app/api/users/[userId]/submissions/route.js
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("leetcode-clone");

    console.log(`Fetching submissions for userId: ${userId}`);

    const submissions = await db.collection("submissions").aggregate([
      {
        $match: { userId: new ObjectId(userId) }
      },
      {
        $lookup: {
          from: "problems",
          localField: "problemId",
          foreignField: "_id",
          as: "problemDetails"
        }
      },
      {
        $unwind: {
          path: "$problemDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          problemId: 1,
          code: 1,
          language: 1,
          status: 1,
          executionTime: 1,
          memoryUsed: 1,
          timestamp: 1,
          problemTitle: { $ifNull: ["$problemDetails.title", "Unknown Problem"] }
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $limit: limit
      }
    ]).toArray();

    console.log(`Found ${submissions.length} submissions for userId: ${userId}`);

    if (submissions.length === 0) {
      return NextResponse.json({ message: 'No submissions yet' }, { status: 200 });
    }

    const formattedSubmissions = submissions.map(sub => ({
      ...sub,
      _id: sub._id.toString(),
      userId: sub.userId.toString(),
      problemId: sub.problemId.toString(),
    }));

    return NextResponse.json(formattedSubmissions, { status: 200 });
  } catch (error) {
    console.error("Error fetching user submissions:", error);
    return NextResponse.json({ error: "Failed to fetch submissions", details: error.message }, { status: 500 });
  }
}