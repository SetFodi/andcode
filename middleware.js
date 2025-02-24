// middleware.js
import { NextResponse } from 'next/server';

// Define which paths require authentication
const authProtectedPaths = [
  '/profile',
  '/problems/create',
  '/admin',
  '/settings'
];

// Define paths that should be accessible even when not authenticated
const publicPaths = [
  '/auth/signin',
  '/auth/signup',
  '/auth/reset-password',
  '/problems',
  '/leaderboard',
  '/api/auth/login',
  '/api/auth/register'
];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Check if the path needs authentication
  const isAuthRequired = authProtectedPaths.some(path => pathname.startsWith(path));
  
  // If it's not a protected path, allow access
  if (!isAuthRequired) {
    return NextResponse.next();
  }
  
  // Check for token in cookies
  const token = request.cookies.get('token');
  
  // If no token and trying to access protected route
  if (!token) {
    // Create the URL to redirect to
    const signInUrl = new URL('/auth/signin', request.url);
    
    // Add the original URL as a parameter to redirect back after login
    signInUrl.searchParams.set('callbackUrl', pathname);
    
    // Redirect to login page
    return NextResponse.redirect(signInUrl);
  }
  
  try {
    // Token exists - we don't verify it here since that requires the JWT_SECRET
    // The actual verification will happen in the API routes
    return NextResponse.next();
  } catch (error) {
    console.error('Token verification failed:', error);
    
    // Token is invalid, redirect to login
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (public assets)
     * But include all paths that require authentication
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
    ...authProtectedPaths
  ],
};