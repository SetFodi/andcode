// app/profile/[userId]/page.js
"use client";

import { useState, useEffect } from "react";
import UserProfile from "@/components/UserProfile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Calendar, Trophy, BookOpen, Award } from "lucide-react";

export default function ProfilePage({ params }) {
  const { userId } = params;
  const [badges, setBadges] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    fetchUserAchievements();
  }, [userId]);

  const fetchUserAchievements = async () => {
    try {
      // Fetch badges
      const badgesResponse = await fetch(`/api/users/${userId}/badges`);
      const badgesData = await badgesResponse.json();
      setBadges(badgesData);

      // Fetch achievements
      const achievementsResponse = await fetch(`/api/users/${userId}/achievements`);
      const achievementsData = await achievementsResponse.json();
      setAchievements(achievementsData);

      // Fetch streak
      const streakResponse = await fetch(`/api/users/${userId}/streak`);
      const streakData = await streakResponse.json();
      setStreak(streakData.currentStreak);
    } catch (error) {
      console.error("Failed to fetch user achievements:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Stats Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-4 gap-4">
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
              {achievements.map((achievement) => (
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
              ))}
            </div>
          </TabsContent>

          <TabsContent value="badges">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {badges.map((badge) => (
                <Card key={badge.id} className="p-4">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                      {/* You can replace this with actual badge icons */}
                      <Award className="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 className="font-semibold">{badge.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{badge.description}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Earned {new Date(badge.earnedAt).toLocaleDateString()}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}