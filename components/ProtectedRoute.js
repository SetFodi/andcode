"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function ProtectedRoute({ children, requireVerification = true }) {
  const { user, loading, canAccess } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in, redirect to sign in
        router.push('/auth/signin');
      } else if (requireVerification && !user.isVerified) {
        // User needs to verify email
        router.push('/auth/verify-email');
      }
    }
  }, [user, loading, requireVerification, router]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // If not logged in or needs verification but isn't verified, don't render children
  if (!user || (requireVerification && !user.isVerified)) {
    return null;
  }
  
  // Otherwise, render the protected content
  return <>{children}</>;
}