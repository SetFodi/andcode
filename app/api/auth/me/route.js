import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb'; // Add this import

export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const client = await clientPromise;
    const db = client.db('leetcode-clone');
    
    const user = await db.collection('users').findOne({ 
      _id: new ObjectId(decoded.userId) // Use ObjectId here
    });
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const { password, ...userWithoutPassword } = user;
    return NextResponse.json({
      ...userWithoutPassword,
      _id: user._id.toString(),
      userId: user._id.toString()
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }
}