import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const client = await clientPromise;
    const db = client.db('leetcode-clone');
    
    const user = await db.collection('users').findOne({ email });
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    
    const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, { 
      expiresIn: '7d' // Changed to 7 days for longer persistence
    });
    
    const { password: _, ...userWithoutPassword } = user;
    const userResponse = {
      ...userWithoutPassword,
      _id: user._id.toString(),
      userId: user._id.toString()
    };

    const response = NextResponse.json({ 
      message: 'Login successful',
      user: userResponse
    });
    
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
    });
    
    return response;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}