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
      <section className="bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-(--breakpoint-xl) px-4 py-8 lg:py-16">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl dark:text-white">
              Welcome back, {user.firstName || "Bowler"}!
            </h1>
            <p className="font-light text-gray-500 md:text-lg dark:text-gray-400">
              {profile.lookingForTeam
                ? "You're actively looking for a team. Check out available teams below!"
                : "Your bowling profile is all set up. Explore teams or create your own!"}
            </p>
          </div>
        </div>
      </section>

      {/* Profile Overview Section */}
      <section className="bg-gray-50 dark:bg-gray-800">
        <div className="mx-auto max-w-(--breakpoint-xl) px-4 py-8 sm:py-16 lg:px-6">
          <div className="mb-8 text-center lg:mb-16">
            <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Your Dashboard
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Your Profile Card */}
            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
              <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Your Profile</h3>
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

            {/* Quick Stats Card */}
            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
              <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Quick Stats</h3>
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

            {/* Quick Actions Card */}
            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
              <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h3>
              <div className="space-y-2">
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
      </section>

      {/* Activity Feed Section */}
      <section className="bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-(--breakpoint-xl) px-4 py-8 sm:py-16 lg:px-6">
          <div className="mb-8 text-center lg:mb-16">
            <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Recent Activity
            </h2>
          </div>
          <div className="mx-auto max-w-5xl rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
            <ActivityFeed activities={recentActivities} />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
