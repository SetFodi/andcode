// middleware.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request) {
  // Get token from header
  const token = request.headers.get('authorization')?.split(' ')[1];

  // Only protect certain paths (remove '/problems' if public access is desired)
  const authPaths = ['/profile']; // Now only /profile is protected
  const isAuthPath = authPaths.some(path => request.nextUrl.pathname.startsWith(path));

  if (isAuthPath) {
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    try {
      // Verify token
      jwt.verify(token, process.env.JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  }

  return NextResponse.next();
}
