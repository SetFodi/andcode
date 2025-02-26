import { NextResponse } from "next/server"; // Updated to modern Next.js Response
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request) {
  try {
    const submissionData = await request.json();

    // Require user authentication
    if (!submissionData.userId) {
      return NextResponse.json({ message: "Login required" }, { status: 401 });
    }

    // Basic input validation
    if (!submissionData.problemId || !submissionData.code || !submissionData.language) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }
    if (typeof submissionData.code !== "string" || submissionData.code.length > 10000) { // Limit code length
      return NextResponse.json({ message: "Invalid or too long code" }, { status: 400 });
    }

    const { problemId, userId, code, language, status, executionTime, memoryUsed } = submissionData;

    // Handle userId flexibly (string or ObjectId)
    let objectIdUser;
    try {
      objectIdUser = ObjectId.isValid(userId) ? new ObjectId(userId) : userId;
    } catch (e) {
      console.error("Invalid userId format:", userId);
      return NextResponse.json({ message: "Invalid userId format" }, { status: 400 });
    }

    const objectIdProblem = new ObjectId(problemId);
    const executionTimeNum = Number(executionTime);
    const memoryUsedNum = Number(memoryUsed);

    if (isNaN(executionTimeNum) || isNaN(memoryUsedNum)) {
      return NextResponse.json({ message: "Execution time and memory used must be valid numbers" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("leetcode-clone");

    const submission = {
      userId: objectIdUser,
      problemId: objectIdProblem,
      code, // Sanitization not applied here as it's code for execution
      language,
      status,
      executionTime: executionTimeNum,
      memoryUsed: memoryUsedNum,
      timestamp: new Date(),
    };

    const result = await db.collection("submissions").insertOne(submission);

    if (!result.acknowledged) {
      throw new Error("Failed to save submission");
    }

    return NextResponse.json({
      message: "Submission saved successfully",
      submissionId: result.insertedId.toString(),
    }, { status: 201 });
  } catch (error) {
    console.error("Error processing submission:", error);
    return NextResponse.json({ message: `Submission error: ${error.message}` }, { status: 500 });
  }
}