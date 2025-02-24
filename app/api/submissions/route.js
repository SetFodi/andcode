import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function POST(request) {
  try {
    const submissionData = await request.json();

    // Ensure required fields are present
    if (!submissionData.problemId || !submissionData.code || !submissionData.language) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { problemId, userId, code, language, status, executionTime, memoryUsed } = submissionData;

    // Convert problemId and userId to ObjectId (MongoDB format)
    const objectIdProblem = new ObjectId(problemId);
    const objectIdUser = new ObjectId(userId);

    // Ensure executionTime and memoryUsed are numbers
    const executionTimeNum = Number(executionTime); // Ensure it's a number
    const memoryUsedNum = Number(memoryUsed); // Ensure it's a number

    // Validate that both values are valid numbers
    if (isNaN(executionTimeNum) || isNaN(memoryUsedNum)) {
      return new Response(
        JSON.stringify({ message: "Execution time and memory used must be valid numbers" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const client = await clientPromise;
    const db = client.db("leetcode-clone");

    // Construct the submission object
    const submission = {
      userId: objectIdUser,
      problemId: objectIdProblem,
      code,
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

    return new Response(
      JSON.stringify({
        message: "Submission saved successfully",
        submissionId: result.insertedId,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error processing submission:", error);
    return new Response(
      JSON.stringify({ message: `Submission error: ${error.message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
