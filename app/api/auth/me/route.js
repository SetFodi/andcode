// app/api/auth/me/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

export async function GET(request) {
  try {
    console.log("ME Endpoint: Request received");
    
    // Get token from cookie
    const token = request.cookies.get('token')?.value;
    
    console.log("ME Endpoint: Token present:", !!token);
    
    if (!token) {
      console.log("ME Endpoint: No token found");
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("ME Endpoint: Token verified successfully", { userId: decoded.userId });
    } catch (error) {
      console.error("ME Endpoint: Token verification failed", error);
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }
    
    if (!decoded.userId) {
      console.log("ME Endpoint: No userId in token");
      return NextResponse.json({ error: 'Invalid token format' }, { status: 401 });
    }
    
    // Get user from database (without returning the password)
    const client = await clientPromise;
    const db = client.db('leetcode-clone');
    
    // Ensure we have a valid ObjectId
    let userObjectId;
    try {
      userObjectId = new ObjectId(decoded.userId);
    } catch (error) {
      console.error("ME Endpoint: Invalid userId format", error);
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }
    
    const user = await db.collection('users').findOne(
      { _id: userObjectId },
      { projection: { password: 0 } }
    );
    
    if (!user) {
      console.log("ME Endpoint: User not found in database");
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    console.log("ME Endpoint: User found", { _id: user._id });
    
    // Return user data
    return NextResponse.json({
      _id: user._id.toString(),
      userId: user._id.toString(), // Include both formats for compatibility
      email: user.email,
      username: user.username,
      ...user
    });
  } catch (error) {
    console.error("ME Endpoint: Unexpected error", error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}