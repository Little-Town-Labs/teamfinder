import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { type PlayerProfile, playerProfiles, users } from "@/drizzle/schema";
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

  if (!user) {
    redirect("/sign-in");
  }

  // Get player profile
  const profile = await db.query.playerProfiles.findFirst({
    where: eq(playerProfiles.userId, user.id),
  }) as PlayerProfile | undefined;

  // If profile not complete, redirect to onboarding
  if (!profile || !profile.profileComplete) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">TeamFinder Dashboard</h1>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Welcome back, {user.firstName || "Bowler"}!
          </h2>
          <p className="mt-2 text-gray-600">
            {profile.lookingForTeam
              ? "You're actively looking for a team. Check out available teams below!"
              : "Your bowling profile is all set up. Explore teams or create your own!"}
          </p>
        </div>

        {/* Profile Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">USBC Member ID</dt>
                <dd className="text-sm text-gray-900">
                  {profile.usbcMemberId}
                  {profile.usbcVerified && (
                    <span className="ml-2 text-green-600 text-xs">✓ Verified</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Average</dt>
                <dd className="text-sm text-gray-900">{profile.currentAverage || "Not set"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">High Game</dt>
                <dd className="text-sm text-gray-900">{profile.highGame || "Not set"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Bowling Hand</dt>
                <dd className="text-sm text-gray-900 capitalize">{profile.bowlingHand}</dd>
              </div>
            </dl>
            <div className="mt-4">
              <a
                href="/profile"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Edit Profile →
              </a>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Teams</dt>
                <dd className="text-2xl font-bold text-gray-900">0</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Pending Invitations</dt>
                <dd className="text-2xl font-bold text-gray-900">0</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Messages</dt>
                <dd className="text-2xl font-bold text-gray-900">0</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <a
                href="/teams/browse"
                className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors"
              >
                Browse Teams
              </a>
              <a
                href="/teams/create"
                className="block w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 text-center rounded-md hover:bg-gray-50 transition-colors"
              >
                Create Team
              </a>
              <a
                href="/players/browse"
                className="block w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 text-center rounded-md hover:bg-gray-50 transition-colors"
              >
                Find Players
              </a>
            </div>
          </div>
        </div>

        {/* Activity Feed Placeholder */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <p className="text-gray-500 text-center py-8">No recent activity yet</p>
        </div>
      </main>
    </div>
  );
}
