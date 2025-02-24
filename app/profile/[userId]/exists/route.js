// app/api/users/[userId]/exists/route.js

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
    
    // Find the user by ID
    const user = await db.collection('users').findOne(
      { _id: userId },
      { projection: { _id: 1 } } // Only need the ID to check existence
    );
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { exists: true },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error checking if user exists:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}