// app/api/users/[userId]/statistics/route.js

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request, { params }) {
  try {
    // Await the params to fix the Next.js warning
    const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB using the clientPromise
    const client = await clientPromise;
    const db = client.db();
    
    // Get all submissions for this user
    const submissions = await db.collection('submissions')
      .find({ userId })
      .toArray();
    
    if (!submissions || submissions.length === 0) {
      // User has no submissions yet
      return NextResponse.json({
        totalSolved: 0,
        successRate: 0,
        ranking: 0,
        difficultyBreakdown: {
          easy: 0,
          medium: 0,
          hard: 0
        }
      });
    }
    
    // Calculate statistics from real submissions
    const acceptedSubmissions = submissions.filter(sub => sub.status === 'ACCEPTED');
    
    // Get unique problems solved (to avoid counting the same problem multiple times)
    const uniqueProblemsSolved = new Set(
      acceptedSubmissions.map(sub => sub.problemId)
    );
    
    // Get difficulty breakdown
    const difficultyCounts = { easy: 0, medium: 0, hard: 0 };
    
    // We need to fetch problem info to get difficulty
    const problemIds = [...uniqueProblemsSolved];
    const problems = await db.collection('problems')
      .find({ _id: { $in: problemIds } })
      .toArray();
    
    // Count problems by difficulty
    problems.forEach(problem => {
      const difficulty = problem.difficulty.toLowerCase();
      if (difficultyCounts[difficulty] !== undefined) {
        difficultyCounts[difficulty]++;
      }
    });
    
    // Calculate success rate
    const uniqueProblemsAttempted = new Set(
      submissions.map(sub => sub.problemId)
    );
    
    const successRate = uniqueProblemsAttempted.size > 0
      ? (uniqueProblemsSolved.size / uniqueProblemsAttempted.size) * 100
      : 0;
    
    // Calculate ranking (this is a placeholder - you'll need a more sophisticated algorithm)
    // For now, we'll fetch all users and rank by problems solved
    const allUserStats = await db.collection('users')
      .aggregate([
        {
          $lookup: {
            from: 'submissions',
            localField: '_id',
            foreignField: 'userId',
            as: 'submissions'
          }
        },
        {
          $project: {
            _id: 1,
            totalSolved: {
              $size: {
                $setIntersection: [
                  { $map: {
                    input: {
                      $filter: {
                        input: '$submissions',
                        as: 'submission',
                        cond: { $eq: ['$$submission.status', 'ACCEPTED'] }
                      }
                    },
                    as: 'sub',
                    in: '$$sub.problemId'
                  }},
                  { $map: {
                    input: {
                      $filter: {
                        input: '$submissions',
                        as: 'submission',
                        cond: { $eq: ['$$submission.status', 'ACCEPTED'] }
                      }
                    },
                    as: 'sub',
                    in: '$$sub.problemId'
                  }}
                ]
              }
            }
          }
        },
        { $sort: { totalSolved: -1 } }
      ])
      .toArray();
    
    // Find the user's rank
    let ranking = allUserStats.findIndex(stat => stat._id === userId) + 1;
    
    // Default to last place if user is not found
    if (ranking === 0) {
      ranking = allUserStats.length + 1;
    }
    
    return NextResponse.json({
      totalSolved: uniqueProblemsSolved.size,
      successRate: parseFloat(successRate.toFixed(2)),
      ranking,
      difficultyBreakdown: difficultyCounts
    });
    
  } catch (error) {
    console.error('Error calculating user statistics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}