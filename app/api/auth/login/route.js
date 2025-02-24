// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import clientPromise from '@/lib/mongodb';

export async function POST(request) {
  try {
    console.log("Login API: Request received");
    
    const { email, password } = await request.json();
    console.log("Login API: Login attempt for email:", email);
    
    const client = await clientPromise;
    const db = client.db('leetcode-clone');
    
    // Find the user by email
    const user = await db.collection('users').findOne({ email });
    
    if (!user) {
      console.log("Login API: User not found with email:", email);
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log("Login API: Password mismatch for user:", email);
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    
    console.log("Login API: Authentication successful for:", email);
    
    // Generate JWT
    const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, { 
      expiresIn: '1d' // Longer expiration for better UX
    });
    
    // Create a response with user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    
    // Prepare user object with stringified _id
    const userResponse = {
      ...userWithoutPassword,
      _id: user._id.toString(),
      userId: user._id.toString()
    };
    
    console.log("Login API: Token generated, setting cookie");
    
    // Set cookie with the token
    const response = NextResponse.json({ 
      message: 'Login successful',
      user: userResponse
    });
    
    // Make sure to set the cookie correctly
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax', // Changed from 'strict' to help with redirects
      path: '/',
      maxAge: 86400 // 1 day in seconds
    });
    
    return response;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}