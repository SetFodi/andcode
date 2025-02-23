// app/api/submissions/route.js
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db("leetcode-clone");
    const data = await request.json();

    const submission = {
      userId: data.userId,
      problemId: new ObjectId(data.problemId),
      code: data.code,
      language: data.language,
      status: data.status,
      executionTime: data.executionTime,
      memoryUsed: data.memoryUsed,
      timestamp: new Date(),
    };

    // Save submission
    await db.collection("submissions").insertOne(submission);

    // Update problem statistics
    await db.collection("problems").updateOne(
      { _id: new ObjectId(data.problemId) },
      {
        $inc: {
          submissions: 1,
          successfulSubmissions: data.status === 'ACCEPTED' ? 1 : 0,
        },
        $set: {
          updatedAt: new Date(),
        }
      }
    );

    // Update user statistics
    await db.collection("users").updateOne(
      { _id: new ObjectId(data.userId) },
      {
        $inc: {
          totalSubmissions: 1,
          successfulSubmissions: data.status === 'ACCEPTED' ? 1 : 0,
        },
        $set: {
          lastSubmission: new Date(),
        }
      }
    );

    return new Response(JSON.stringify(submission), { status: 201 });
  } catch (error) {
    return new Response("Failed to save submission", { status: 500 });
  }
}