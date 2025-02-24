import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
  try {
    const { userId } = await params;
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("leetcode-clone");

    // Handle userId as either string or ObjectId
    const queryUserId = ObjectId.isValid(userId) ? new ObjectId(userId) : userId;

    const submissions = await db
      .collection("submissions")
      .find({ userId: queryUserId })
      .sort({ timestamp: -1 }) // Sort by newest first
      .limit(10)
      .toArray();

    if (submissions.length === 0) {
      return NextResponse.json({ message: 'No submissions yet' }, { status: 200 });
    }

    // Convert ObjectIds to strings for JSON response
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