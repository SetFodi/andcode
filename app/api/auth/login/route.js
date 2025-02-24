// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import clientPromise from '@/lib/mongodb';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    const client = await clientPromise;
    const db = client.db('leetcode-clone');
    
    // Find the user by email
    const user = await db.collection('users').findOne({ email });
    
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    
    // Generate JWT
    const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, { 
      expiresIn: '1d' // Longer expiration for better UX
    });
    
    // Create a response with user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    
    // Set cookie with the token
    const response = NextResponse.json({ 
      message: 'Login successful',
      user: userWithoutPassword
    });
    
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      path: '/',
      maxAge: 86400 // 1 day in seconds
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
