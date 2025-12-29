import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { ActivityFeed } from "@/components/ActivityFeed/ActivityFeed";
import { Button } from "@/components/Button/Button";
import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import { activityLogs, type PlayerProfile, playerProfiles, users } from "@/drizzle/schema";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get user
  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, userId),
  });

  // If user is authenticated but not in database, send to onboarding
  // This handles cases where webhook hasn't fired yet or user was created outside normal flow
  if (!user) {
    redirect("/onboarding");
  }

  // Get player profile
  const profile = await db.query.playerProfiles.findFirst({
    where: eq(playerProfiles.userId, user.id),
  }) as PlayerProfile | undefined;

  // If profile not complete, redirect to onboarding
  if (!profile || !profile.profileComplete) {
    redirect("/onboarding");
  }

  // Get recent activity logs
  const recentActivities = await db.query.activityLogs.findMany({
    where: eq(activityLogs.userId, user.id),
    orderBy: [desc(activityLogs.createdAt)],
    limit: 10,
  });

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCA0IDEuNzkgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10"></div>
        <div className="relative mx-auto max-w-(--breakpoint-xl) px-4 py-16 lg:py-24">
          <div className="text-center">
            <div className="mb-6 inline-block rounded-2xl bg-white/10 px-4 py-2 backdrop-blur-sm">
              <span className="text-sm font-semibold text-white">🎳 TeamFinder Dashboard</span>
            </div>
            <h1 className="mb-6 text-5xl font-black tracking-tight text-white drop-shadow-lg md:text-6xl lg:text-7xl">
              Welcome back, {user.firstName || "Bowler"}!
            </h1>
            <p className="mx-auto max-w-2xl text-xl font-medium text-white/90 drop-shadow-md md:text-2xl">
              {profile.lookingForTeam
                ? "You're actively looking for a team. Check out available teams below!"
                : "Your bowling profile is all set up. Explore teams or create your own!"}
            </p>
          </div>
        </div>
      </section>

      {/* Profile Overview Section */}
      <section className="bg-gray-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800">
        <div className="mx-auto max-w-(--breakpoint-xl) px-4 py-12 sm:py-20 lg:px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-black tracking-tight text-transparent md:text-5xl">
              Your Dashboard
            </h2>
            <p className="text-lg font-medium text-gray-600">Track your bowling journey</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Your Profile Card */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 p-[2px] shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-blue-500/50">
              <div className="relative h-full rounded-3xl bg-white p-6 dark:bg-gray-900">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 p-3">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">Your Profile</h3>
                </div>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">USBC Member ID</dt>
                    <dd className="text-sm text-gray-900 dark:text-white">
                      {profile.usbcMemberId}
                      {profile.usbcVerified && (
                        <span className="ml-2 text-xs text-green-600 dark:text-green-400">✓ Verified</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Average</dt>
                    <dd className="text-sm text-gray-900 dark:text-white">{profile.currentAverage || "Not set"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">High Game</dt>
                    <dd className="text-sm text-gray-900 dark:text-white">{profile.highGame || "Not set"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Bowling Hand</dt>
                    <dd className="text-sm capitalize text-gray-900 dark:text-white">{profile.bowlingHand}</dd>
                  </div>
                </dl>
                <div className="mt-4">
                  <Button href="/profile" intent="secondary" size="sm">
                    Edit Profile →
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 p-[2px] shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-purple-500/50">
              <div className="relative h-full rounded-3xl bg-white p-6 dark:bg-gray-900">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-3">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">Quick Stats</h3>
                </div>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Teams</dt>
                    <dd className="text-2xl font-extrabold text-gray-900 dark:text-white">0</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Invitations</dt>
                    <dd className="text-2xl font-extrabold text-gray-900 dark:text-white">0</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Messages</dt>
                    <dd className="text-2xl font-extrabold text-gray-900 dark:text-white">0</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 to-emerald-500 p-[2px] shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-green-500/50">
              <div className="relative h-full rounded-3xl bg-white p-6 dark:bg-gray-900">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 p-3">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">Quick Actions</h3>
                </div>
                <div className="space-y-3">
                  <Button href="/teams/browse" className="w-full">
                    Browse Teams
                  </Button>
                  <Button href="/teams/create" intent="secondary" className="w-full">
                    Create Team
                  </Button>
                  <Button href="/players/browse" intent="secondary" className="w-full">
                    Find Players
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Activity Feed Section */}
      <section className="bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <div className="mx-auto max-w-(--breakpoint-xl) px-4 py-8 sm:py-16 lg:px-6">
          <div className="mb-8 text-center lg:mb-16">
            <h2 className="mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-4xl font-black tracking-tight text-transparent md:text-5xl">
              Recent Activity
            </h2>
            <p className="text-lg font-medium text-gray-600 dark:text-gray-400">Track your latest actions and updates</p>
          </div>
          <div className="mx-auto max-w-5xl">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-[2px] shadow-2xl">
              <div className="rounded-3xl bg-white p-6 dark:bg-gray-900">
                <ActivityFeed activities={recentActivities} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
