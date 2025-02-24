import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
  try {
    // Await params to get userId properly
    const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("leetcode-clone");

    // Find submissions for the given userId
    const submissions = await db
      .collection("submissions")
      .find({ userId: new ObjectId(userId) })
      .toArray();

    return NextResponse.json(submissions, { status: 200 });
  } catch (error) {
    console.error("Error fetching user submissions:", error);
    return NextResponse.json({ error: "Failed to fetch submissions", details: error.message }, { status: 500 });
  }
}
