import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
  try {
    const { userId } = await params;
    
    console.log(`API: /api/users/[userId] called with userId: ${userId}`);
    
    if (!userId) {
      console.log('API: userId is missing');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Connect to MongoDB using the clientPromise
    console.log('API: Connecting to MongoDB...');
    const client = await clientPromise;
    const db = client.db("leetcode-clone");
    
    // Convert userId to ObjectId
    let queryId;
    try {
      queryId = new ObjectId(userId);
    } catch (e) {
      console.log(`API: Invalid userId format: ${userId}`);
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }
    
    // Find the user by ID
    console.log(`API: Looking for user with ID: ${queryId}`);
    const user = await db.collection('users').findOne(
      { _id: queryId },
      { projection: { password: 0 } }
    );
    
    if (!user) {
      console.log(`API: User not found with ID: ${userId}`);
      // For development, you can return mock data, but in production, return 404
      // const mockUser = {
      //   _id: userId,
      //   username: `User${userId.substring(0, 5)}`,
      //   email: `user${userId.substring(0, 5)}@example.com`,
      //   createdAt: new Date().toISOString(),
      //   updatedAt: new Date().toISOString(),
      // };
      // return NextResponse.json(mockUser);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    console.log(`API: User found: ${user.username || 'unnamed'}`);
    // Convert ObjectId to string
    const userData = {
      ...user,
      _id: user._id.toString(),
    };
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}