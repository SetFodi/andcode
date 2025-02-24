"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/hooks/useAuth"; // Import the updated useAuth hook
import UserProfile from "@/components/UserProfile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Calendar, Trophy, BookOpen, Award } from "lucide-react";

export default function ProfilePage({ params }) {
  const { userId } = params;
  const router = useRouter();
  const { user, loading } = useAuth(); // Use the auth context
  const [badges, setBadges] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Only fetch data if user is authenticated and not loading
    if (!loading) {
      if (!user) {
        // Redirect if not authenticated
        router.push('/auth/signin');
        return;
      }
      
      // User is authenticated, fetch profile data
      fetchUserAchievements();
    }
  }, [userId, user, loading, router]);

  const fetchUserAchievements = async () => {
    try {
      // Fetch with credentials to include cookies
      const badgesResponse = await fetch(`/api/users/${userId}/badges`, {
        method: "GET",
        credentials: "include", // Important for cookies
      });

      if (!badgesResponse.ok) {
        throw new Error(`Failed to fetch badges: ${badgesResponse.status}`);
      }

      const badgesData = await badgesResponse.json();
      setBadges(badgesData);

      // Fetch achievements
      const achievementsResponse = await fetch(`/api/users/${userId}/achievements`, {
        method: "GET",
        credentials: "include", // Important for cookies
      });

      if (!achievementsResponse.ok) {
        throw new Error(`Failed to fetch achievements: ${achievementsResponse.status}`);
      }

      const achievementsData = await achievementsResponse.json();
      setAchievements(achievementsData);

      // Fetch streak
      const streakResponse = await fetch(`/api/users/${userId}/streak`, {
        method: "GET",
        credentials: "include", // Important for cookies
      });

      if (!streakResponse.ok) {
        throw new Error(`Failed to fetch streak: ${streakResponse.status}`);
      }

      const streakData = await streakResponse.json();
      setStreak(streakData.currentStreak);
    } catch (error) {
      console.error("Failed to fetch user achievements:", error);
    }
  };

  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If user is not authenticated and not loading, the useEffect will handle redirect

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Stats Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Current Streak</p>
                <p className="font-semibold">{streak} days</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-500">Achievements</p>
                <p className="font-semibold">{achievements.length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Solutions Shared</p>
                <p className="font-semibold">{badges.filter(b => b.type === 'solution').length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Badges Earned</p>
                <p className="font-semibold">{badges.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <UserProfile userId={userId} />
          </TabsContent>

          <TabsContent value="achievements">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.length > 0 ? (
                achievements.map((achievement) => (
                  <Card key={achievement.id} className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{achievement.title}</h3>
                        <p className="text-sm text-gray-500">{achievement.description}</p>
                        <p className="text-xs text-gray-400">Earned on {new Date(achievement.earnedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No achievements earned yet. Solve problems to earn achievements!
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="badges">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {badges.length > 0 ? (
                badges.map((badge) => (
                  <Card key={badge.id} className="p-4">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                        <Award className="w-8 h-8 text-blue-500" />
                      </div>
                      <h3 className="font-semibold">{badge.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{badge.description}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        Earned {new Date(badge.earnedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No badges earned yet. Complete challenges to earn badges!
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}