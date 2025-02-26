// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Define protected and public paths
  const authProtectedPaths = [
    '/profile',
    '/problems/create',
    '/admin',
    '/settings',
  ];
  
  const publicPaths = [
    '/auth/signin',
    '/auth/signup',
    '/auth/reset-password',
    '/auth/forgot-password',
    '/problems',
    '/leaderboard',
    '/forum',
    '/api/auth/login',
    '/api/auth/register',
    '/',
  ];
  
  // Check if the path needs authentication
  const isAuthRequired = authProtectedPaths.some(path => pathname.startsWith(path));
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  // Allow access to public paths without checking token
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // If the path requires authentication
  if (isAuthRequired) {
    // Changed 'token' to 'sessionToken' to match your authentication system
    const sessionToken = request.cookies.get('sessionToken')?.value;
    
    if (!sessionToken) {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }
    
    // Token exists; assume valid for middleware purposes (verified in API)
    return NextResponse.next();
  }
  
  // Allow all other routes by default
  return NextResponse.next();
}

// Static matcher configuration
export const config = {
  matcher: [
    '/profile/:path*',
    '/problems/create',
    '/admin',
    '/settings',
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)', // Match all except static assets and API routes
  ],
};