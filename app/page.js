'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { motion } from "framer-motion";
import { Code, Star, ArrowRight, Eye, CheckCircle, Trophy, Cpu, Activity } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Redirect to problems if logged in and not in loading state
    if (user && !loading) {
      router.push("/problems");
    }
  }, [user, loading, router]);

  // If still loading auth state, show a loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="relative w-20 h-20">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Code className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>
    );
  }

  // Animation variables
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-40 left-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-40 right-40 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] px-4 py-12 overflow-hidden">
        <motion.div 
          className="max-w-5xl w-full text-center"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Logo and main headline */}
          <motion.div variants={itemVariants} className="mb-8 flex justify-center">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <div className="bg-white dark:bg-gray-900 p-3 rounded-lg">
                <Code className="w-12 h-12 text-blue-500" />
              </div>
            </div>
          </motion.div>

          {/* Headline with animated gradient effect */}
          <motion.h1 
            variants={itemVariants}
            className="text-6xl font-bold mb-6 font-heading"
          >
            <span className="inline-block animate-gradient bg-gradient-to-r from-blue-500 via-purple-500 to-violet-500 bg-clip-text text-transparent">
              Sharpen Your Coding Skills
            </span>
          </motion.h1>
         
          {/* Improved subtitle */}
          <motion.p 
            variants={itemVariants}
            className="text-xl dark:text-gray-300 text-gray-700 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Master algorithms, ace technical interviews, and become a better programmer through our curated collection of real-world coding challenges.
          </motion.p>
         
          {user ? (
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/problems"
                  className="group flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  Start Solving
                  <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                </Link>
               
                <Link
                  href="/profile"
                  className="group flex items-center gap-2 px-8 py-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-lg shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 transform hover:-translate-y-1"
                >
                  View Profile
                  <Eye className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <motion.div 
                variants={itemVariants} 
                className="dark:text-blue-400 text-blue-600 mt-4 text-lg font-medium"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                Welcome back, {user.username}!
              </motion.div>
            </motion.div>
          ) : (
            <motion.div variants={itemVariants} className="space-y-16">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/signup"
                  className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  Join Now
                  <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/auth/signin"
                  className="group flex items-center gap-2 px-8 py-4 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 bg-white text-gray-800 hover:bg-gray-50 rounded-xl transition-all duration-300 font-medium text-lg shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700 transform hover:-translate-y-1"
                >
                  Sign In
                  <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              
              {/* Stats section */}
              <motion.div 
                variants={itemVariants}
                className="flex flex-wrap justify-center gap-6 max-w-3xl mx-auto mb-12"
              >
                <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-3 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                    <Cpu className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">350+</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Coding Problems</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-3 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-purple-600 dark:text-purple-400">1.2M+</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Submissions</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-3 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                    <Activity className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-green-600 dark:text-green-400">50K+</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Active Users</div>
                  </div>
                </div>
              </motion.div>

              {/* Redesigned feature cards section */}
              <motion.div 
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
              >
                {[
                  {
                    icon: <Cpu className="w-12 h-12 text-blue-500" />,
                    title: "Diverse Problem Set",
                    description: "From easy to hard, covering algorithms, data structures, and common interview patterns.",
                    color: "from-blue-500 to-blue-600",
                    bgLight: "bg-blue-50",
                    bgDark: "dark:bg-blue-900/20",
                  },
                  {
                    icon: <Activity className="w-12 h-12 text-purple-500" />,
                    title: "Performance Analytics",
                    description: "Monitor your improvement with detailed statistics, comparisons, and time tracking.",
                    color: "from-purple-500 to-purple-600",
                    bgLight: "bg-purple-50",
                    bgDark: "dark:bg-purple-900/20",
                  },
                  {
                    icon: <Trophy className="w-12 h-12 text-amber-500" />,
                    title: "Competitive Environment",
                    description: "Test your skills in weekly contests and climb up the global leaderboard.",
                    color: "from-amber-500 to-amber-600",
                    bgLight: "bg-amber-50",
                    bgDark: "dark:bg-amber-900/20",
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.2)" }}
                    className={`p-8 ${feature.bgLight} ${feature.bgDark} rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transform transition-all duration-300`}
                  >
                    <div className={`bg-gradient-to-br ${feature.color} rounded-2xl p-4 w-16 h-16 flex items-center justify-center mb-4 shadow-lg`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3 dark:text-white">{feature.title}</h3>
                    <p className="dark:text-gray-300 text-gray-600">{feature.description}</p>
                  </motion.div>
                ))}
              </motion.div>
              
              {/* Testimonials or social proof section */}
              <motion.div variants={itemVariants} className="mt-20 text-center max-w-3xl mx-auto">
                <div className="flex justify-center mb-6">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-lg italic text-gray-600 dark:text-gray-300">
                  "The best platform I've found for preparing for technical interviews. 
                  The curated problems helped me land my dream job at a top tech company."
                </p>
                <div className="mt-4 font-medium">
                  <span className="text-gray-900 dark:text-gray-100">Alex Chen</span>
                  <span className="text-gray-500 dark:text-gray-400 mx-2">•</span>
                  <span className="text-blue-600 dark:text-blue-400">Software Engineer at Google</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}