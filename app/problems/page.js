'use client'; // Add this directive to make it a Client Component
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProblemsList from '@/components/ProblemsList';
import ProtectedRoute from '@/components/ProtectedRoute';
import { motion } from 'framer-motion';
import { Code, Brain, BookOpen, Database, Cpu } from 'lucide-react';

export default function ProblemsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin?callbackUrl=/problems');
    }
  }, [user, loading, router]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-block"
            >
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
                Loading Challenges
              </h1>
            </motion.div>
          </div>
          
          {/* Loading Animation */}
          <div className="relative h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mb-8">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-violet-500"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut"
              }}
            />
          </div>
          
          {/* Loading icons */}
          <div className="flex justify-center space-x-8">
            {[Code, Brain, BookOpen, Database, Cpu].map((Icon, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0.3 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: index * 0.2
                }}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <Icon className="w-6 h-6 text-blue-500 dark:text-blue-400" />
              </motion.div>
            ))}
          </div>
          
          {/* Loading message */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-center mt-8 text-gray-600 dark:text-gray-400"
          >
            Preparing your coding challenges...
          </motion.p>
        </div>
      </div>
    );
  }
  
  if (!user) return null; // Will redirect due to useEffect
  
  return (
    <ProtectedRoute requireVerification={true}>
      <ProblemsList />
    </ProtectedRoute>
  );
}