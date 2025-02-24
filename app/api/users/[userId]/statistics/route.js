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
        totalSubmissions: 0,
        ranking: 0,
        difficultyBreakdown: { easy: 0, medium: 0, hard: 0 },
        activityGraph: [],
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

    // Calculate weekly activity (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 6); // Last 7 days including today
    const activityGraph = await db
      .collection("submissions")
      .aggregate([
        { $match: { userId: new ObjectId(userId), timestamp: { $gte: oneWeekAgo } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
            },
            submissions: { $sum: 1 },
          },
        },
        {
          $project: {
            date: "$_id",
            submissions: 1,
            _id: 0,
          },
        },
        { $sort: { date: 1 } }, // Sort by date ascending
      ])
      .toArray();

    // Fill in missing days with 0 submissions
    const activityData = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(oneWeekAgo);
      date.setDate(oneWeekAgo.getDate() + i);
      const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
      const entry = activityGraph.find((item) => item.date === dateStr) || { date: dateStr, submissions: 0 };
      activityData.push(entry);
    }

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
      totalSubmissions,
      ranking: userRanking || 0,
      difficultyBreakdown: difficultyCounts,
      activityGraph: activityData,
    });
  } catch (error) {
    console.error("Error calculating user statistics:", error);
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}