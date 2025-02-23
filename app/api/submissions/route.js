// app/api/submissions/route.js
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

// Remove getServerSession and authOptions if you no longer need authentication

export async function POST(request) {
  try {
    // Remove token validation
    // Instead, use a dummy user or handle submissions without authentication
    const dummyUserId = "64bfc9f2e9a1a123456789ab"; // Replace with a valid ObjectId string if needed

    const client = await clientPromise;
    const db = client.db("leetcode-clone");
    
    const data = await request.json();
    const submission = {
      // Use dummyUserId converted to an ObjectId if you expect that format
      userId: new ObjectId(dummyUserId),
      problemId: new ObjectId(data.problemId),
      code: data.code,
      language: data.language,
      status: data.status,
      executionTime: data.executionTime,
      memoryUsed: data.memoryUsed,
      timestamp: new Date(),
    };

    // Save submission
    const result = await db.collection("submissions").insertOne(submission);

    // Update problem statistics
    await db.collection("problems").updateOne(
      { _id: new ObjectId(data.problemId) },
      {
        $inc: {
          submissions: 1,
          successfulSubmissions: data.status === "ACCEPTED" ? 1 : 0,
        },
        $set: {
          updatedAt: new Date(),
        },
      }
    );

    // Optionally, update user statistics if you have a users collection
    await db.collection("users").updateOne(
      { _id: new ObjectId(dummyUserId) },
      {
        $inc: {
          totalSubmissions: 1,
          successfulSubmissions: data.status === "ACCEPTED" ? 1 : 0,
        },
        $set: {
          lastSubmission: new Date(),
        },
      }
    );

    return new Response(
      JSON.stringify({ ...submission, _id: result.insertedId }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Submission error:", error);
    return new Response("Failed to save submission", { status: 500 });
  }
}

export async function GET(request) {
  try {
    // Remove token validation
    const { searchParams } = new URL(request.url);
    const problemId = searchParams.get("problemId");
    const userId = searchParams.get("userId");

    const client = await clientPromise;
    const db = client.db("leetcode-clone");

    const query = {};
    if (problemId) query.problemId = new ObjectId(problemId);
    if (userId) query.userId = new ObjectId(userId);

    const submissions = await db
      .collection("submissions")
      .find(query)
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    return new Response(JSON.stringify(submissions), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to fetch submissions:", error);
    return new Response("Failed to fetch submissions", { status: 500 });
  }
}
