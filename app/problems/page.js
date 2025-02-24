'use client'; // Add this directive to make it a Client Component
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProblemsList from '@/components/ProblemsList';

export default function ProblemsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin?callbackUrl=/problems');
    }
  }, [user, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null; // Will redirect due to useEffect

  return (
    <div>

      <ProblemsList />
    </div>
  );
}