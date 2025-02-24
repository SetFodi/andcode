import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("leetcode-clone");

    // Fetch all submissions for this user
    const submissions = await db
      .collection("submissions")
      .find({ userId: new ObjectId(userId) })
      .toArray();

    if (!submissions || submissions.length === 0) {
      return NextResponse.json({
        totalSolved: 0,
        successRate: 0,
        ranking: 0,
        difficultyBreakdown: { easy: 0, medium: 0, hard: 0 },
      });
    }

    // Calculate total submissions and successful submissions
    const totalSubmissions = submissions.length;
    const successfulSubmissions = submissions.filter((sub) => sub.status === "ACCEPTED").length;
    const uniqueProblemsSolved = new Set(
      submissions.filter((sub) => sub.status === "ACCEPTED").map((sub) => sub.problemId.toString())
    );
    const uniqueProblemsAttempted = new Set(submissions.map((sub) => sub.problemId.toString()));

    // Success rate: total successful submissions / total submissions
    const successRate = totalSubmissions > 0 
      ? (successfulSubmissions / totalSubmissions) * 100 
      : 0;

    // Fetch problem difficulties for breakdown
    const problemIds = [...uniqueProblemsSolved].map((id) => new ObjectId(id));
    const problems = await db
      .collection("problems")
      .find({ _id: { $in: problemIds } })
      .toArray();

    const difficultyCounts = { easy: 0, medium: 0, hard: 0 };
    problems.forEach((problem) => {
      const difficulty = problem.difficulty?.toLowerCase();
      if (difficulty in difficultyCounts) {
        difficultyCounts[difficulty]++;
      }
    });

    // Calculate ranking based on totalSolved and successRate
    const allUserStats = await db
      .collection("submissions")
      .aggregate([
        {
          $group: {
            _id: "$userId",
            totalSubmissions: { $sum: 1 },
            successfulSubmissions: { $sum: { $cond: [{ $eq: ["$status", "ACCEPTED"] }, 1, 0] } },
            uniqueProblemsSolved: { $addToSet: "$problemId" },
          },
        },
        {
          $project: {
            userId: "$_id",
            totalSolved: { $size: "$uniqueProblemsSolved" },
            successRate: {
              $multiply: [
                { $divide: ["$successfulSubmissions", "$totalSubmissions"] },
                100,
              ],
            },
          },
        },
        { $sort: { totalSolved: -1, successRate: -1 } },
      ])
      .toArray();

    const userRanking =
      allUserStats.findIndex(
        (stat) => stat.userId.toString() === userId.toString()
      ) + 1;

    console.log(
      `User ${userId}: totalSubmissions=${totalSubmissions}, successfulSubmissions=${successfulSubmissions}, uniqueProblemsAttempted=${uniqueProblemsAttempted.size}, uniqueProblemsSolved=${uniqueProblemsSolved.size}, successRate=${successRate.toFixed(2)}%, ranking=${userRanking}`
    );

    return NextResponse.json({
      totalSolved: uniqueProblemsSolved.size,
      successRate: parseFloat(successRate.toFixed(2)),
      ranking: userRanking || 0,
      difficultyBreakdown: difficultyCounts,
    });
  } catch (error) {
    console.error("Error calculating user statistics:", error);
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}