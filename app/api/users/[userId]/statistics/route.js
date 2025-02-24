// app/api/users/[userId]/statistics/route.js
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

    const submissions = await db.collection('submissions')
      .find({ userId: new ObjectId(userId) })
      .toArray();

    if (!submissions || submissions.length === 0) {
      return NextResponse.json({
        totalSolved: 0,
        successRate: 0,
        ranking: 0,
        difficultyBreakdown: { easy: 0, medium: 0, hard: 0 }
      });
    }

    const acceptedSubmissions = submissions.filter(sub => sub.status === 'ACCEPTED');
    const uniqueProblemsSolved = new Set(acceptedSubmissions.map(sub => sub.problemId.toString()));
    
    const problemIds = [...uniqueProblemsSolved].map(id => new ObjectId(id));
    const problems = await db.collection('problems')
      .find({ _id: { $in: problemIds } })
      .toArray();

    const difficultyCounts = { easy: 0, medium: 0, hard: 0 };
    problems.forEach(problem => {
      const difficulty = problem.difficulty?.toLowerCase();
      if (difficulty in difficultyCounts) {
        difficultyCounts[difficulty]++;
      }
    });

    const uniqueProblemsAttempted = new Set(submissions.map(sub => sub.problemId.toString()));
    const successRate = uniqueProblemsAttempted.size > 0
      ? (uniqueProblemsSolved.size / uniqueProblemsAttempted.size) * 100
      : 0;

    return NextResponse.json({
      totalSolved: uniqueProblemsSolved.size,
      successRate: parseFloat(successRate.toFixed(2)),
      ranking: 0, // Placeholder
      difficultyBreakdown: difficultyCounts
    });
  } catch (error) {
    console.error('Error calculating user statistics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}