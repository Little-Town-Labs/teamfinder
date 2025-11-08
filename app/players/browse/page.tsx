import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { playerProfiles, users } from "@/drizzle/schema";
import type { PlayerProfile, User } from "@/drizzle/schema";

import { db } from "@/lib/db";

export default async function BrowsePlayersPage() {
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
  });

  // If profile not complete, redirect to onboarding
  if (!profile || !profile.profileComplete) {
    redirect("/onboarding");
  }

  // Get all players looking for teams or open to substitute
  const availablePlayers = (await db.query.playerProfiles.findMany({
    where: eq(playerProfiles.lookingForTeam, true),
    with: {
      user: true,
    },
    orderBy: (playerProfiles, { desc }) => [desc(playerProfiles.updatedAt)],
  })) as Array<PlayerProfile & { user: User }>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <Link
              href="/dashboard"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium mb-2 inline-block"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Find Players</h1>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Section (placeholder for future) */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Players</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="minAverage" className="block text-sm font-medium text-gray-700">
                Min Average
              </label>
              <input
                type="number"
                id="minAverage"
                placeholder="e.g., 150"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="maxAverage" className="block text-sm font-medium text-gray-700">
                Max Average
              </label>
              <input
                type="number"
                id="maxAverage"
                placeholder="e.g., 200"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="bowlingHand" className="block text-sm font-medium text-gray-700">
                Bowling Hand
              </label>
              <select
                id="bowlingHand"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="right">Right</option>
                <option value="left">Left</option>
              </select>
            </div>

            <div className="flex items-end">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Players List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availablePlayers.length === 0 ? (
            <div className="col-span-full bg-white shadow rounded-lg p-8 text-center">
              <p className="text-gray-500">No players are currently looking for teams.</p>
              <p className="text-sm text-gray-400 mt-2">Check back later!</p>
            </div>
          ) : (
            availablePlayers.map((player) => (
              <div
                key={player.id}
                className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  {player.user.imageUrl && (
                    <Image
                      src={player.user.imageUrl}
                      alt={player.user.firstName || "Player"}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {player.user.firstName} {player.user.lastName}
                    </h3>
                    <div className="flex gap-2 mt-1">
                      {player.lookingForTeam && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          Looking for Team
                        </span>
                      )}
                      {player.openToSubstitute && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                          Open to Sub
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <dl className="space-y-2 mb-4">
                  {player.currentAverage && (
                    <div className="flex justify-between text-sm">
                      <dt className="text-gray-500">Average:</dt>
                      <dd className="font-medium text-gray-900">{player.currentAverage}</dd>
                    </div>
                  )}
                  {player.highGame && (
                    <div className="flex justify-between text-sm">
                      <dt className="text-gray-500">High Game:</dt>
                      <dd className="font-medium text-gray-900">{player.highGame}</dd>
                    </div>
                  )}
                  {player.yearsExperience && (
                    <div className="flex justify-between text-sm">
                      <dt className="text-gray-500">Experience:</dt>
                      <dd className="font-medium text-gray-900">
                        {player.yearsExperience} {player.yearsExperience === 1 ? "year" : "years"}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-500">Hand:</dt>
                    <dd className="font-medium text-gray-900 capitalize">{player.bowlingHand}</dd>
                  </div>
                  {player.preferredCompetitionLevel && (
                    <div className="flex justify-between text-sm">
                      <dt className="text-gray-500">Level:</dt>
                      <dd className="font-medium text-gray-900 capitalize">
                        {player.preferredCompetitionLevel}
                      </dd>
                    </div>
                  )}
                </dl>

                {player.preferredTeamTypes && player.preferredTeamTypes.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Preferred Team Types:</p>
                    <div className="flex flex-wrap gap-1">
                      {player.preferredTeamTypes.map((type) => (
                        <span
                          key={type}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded capitalize"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {player.bio && (
                  <p className="text-sm text-gray-700 mb-4 line-clamp-3">{player.bio}</p>
                )}

                <div className="pt-4 border-t">
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">
                    Send Message
                  </button>
                </div>

                {player.usbcVerified && (
                  <div className="mt-2 text-center">
                    <span className="text-xs text-green-600">✓ USBC Verified</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
