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

    // Calculate success rate
    const acceptedSubmissions = submissions.filter((sub) => sub.status === "ACCEPTED");
    const uniqueProblemsSolved = new Set(acceptedSubmissions.map((sub) => sub.problemId.toString()));
    const totalAttempts = submissions.length; // Total submissions (success + fail)
    const successRate = totalAttempts > 0 ? (uniqueProblemsSolved.size / totalAttempts) * 100 : 0;

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
            acceptedSubmissions: {
              $sum: { $cond: [{ $eq: ["$status", "ACCEPTED"] }, 1, 0] },
            },
            uniqueProblemsSolved: { $addToSet: "$problemId" },
          },
        },
        {
          $project: {
            userId: "$_id",
            totalSolved: { $size: "$uniqueProblemsSolved" },
            successRate: {
              $multiply: [
                { $divide: [{ $size: "$uniqueProblemsSolved" }, "$totalSubmissions"] },
                100,
              ],
            },
          },
        },
        { $sort: { totalSolved: -1, successRate: -1 } }, // Rank by totalSolved first, then successRate
      ])
      .toArray();

    const userRanking =
      allUserStats.findIndex(
        (stat) => stat.userId.toString() === userId.toString()
      ) + 1;

    return NextResponse.json({
      totalSolved: uniqueProblemsSolved.size,
      successRate: parseFloat(successRate.toFixed(2)),
      ranking: userRanking || 0,
      difficultyBreakdown: difficultyCounts,
    });
  } catch (error) {
    console.error("Error calculating user statistics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}