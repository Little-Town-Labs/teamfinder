import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";

import { playerProfiles, teams, users } from "@/drizzle/schema";
import type { Team, User } from "@/drizzle/schema";

import { db } from "@/lib/db";

export default async function BrowseTeamsPage() {
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

  // Get all active teams looking for players
  const availableTeams = (await db.query.teams.findMany({
    where: eq(teams.lookingForPlayers, true),
    with: {
      captain: true,
    },
    orderBy: (teams, { desc }) => [desc(teams.createdAt)],
  })) as Array<Team & { captain: User }>;

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
            <h1 className="text-2xl font-bold text-gray-900">Browse Teams</h1>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Section (placeholder for future) */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Teams</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="teamType" className="block text-sm font-medium text-gray-700">
                Team Type
              </label>
              <select
                id="teamType"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="singles">Singles</option>
                <option value="doubles">Doubles</option>
                <option value="team">Team</option>
              </select>
            </div>

            <div>
              <label htmlFor="competitionLevel" className="block text-sm font-medium text-gray-700">
                Competition Level
              </label>
              <select
                id="competitionLevel"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Levels</option>
                <option value="recreational">Recreational</option>
                <option value="league">League</option>
                <option value="competitive">Competitive</option>
                <option value="professional">Professional</option>
              </select>
            </div>

            <div>
              <label htmlFor="genderType" className="block text-sm font-medium text-gray-700">
                Gender Type
              </label>
              <select
                id="genderType"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="male">Men's Team</option>
                <option value="female">Women's Team</option>
                <option value="other">Mixed Team</option>
              </select>
            </div>

            <div className="flex items-end">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Teams List */}
        <div className="space-y-6">
          {availableTeams.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <p className="text-gray-500">No teams are currently looking for players.</p>
              <p className="text-sm text-gray-400 mt-2">Check back later or create your own team!</p>
            </div>
          ) : (
            availableTeams.map((team) => (
              <div key={team.id} className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{team.name}</h3>
                      {team.lookingForPlayers && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                          Recruiting
                        </span>
                      )}
                    </div>

                    <div className="flex gap-4 text-sm text-gray-600 mb-3">
                      <span className="capitalize">{team.teamType}</span>
                      <span>•</span>
                      <span className="capitalize">{team.competitionLevel}</span>
                      <span>•</span>
                      <span className="capitalize">
                        {team.genderType === "male"
                          ? "Men's"
                          : team.genderType === "female"
                            ? "Women's"
                            : "Mixed"}
                      </span>
                    </div>

                    {team.description && (
                      <p className="text-gray-700 mb-4 line-clamp-2">{team.description}</p>
                    )}

                    <div className="flex gap-6 text-sm">
                      <div>
                        <span className="text-gray-500">Open Positions:</span>
                        <span className="ml-1 font-medium text-gray-900">{team.openPositions}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Roster:</span>
                        <span className="ml-1 font-medium text-gray-900">
                          {team.currentRosterSize}/{team.maxRosterSize}
                        </span>
                      </div>
                      {team.teamAverage && (
                        <div>
                          <span className="text-gray-500">Team Avg:</span>
                          <span className="ml-1 font-medium text-gray-900">{team.teamAverage}</span>
                        </div>
                      )}
                    </div>

                    {team.recruitmentRequirements && (
                      <div className="mt-3 text-sm text-gray-600">
                        {team.recruitmentRequirements.minAverage && (
                          <span>
                            Min Avg: {team.recruitmentRequirements.minAverage}
                            {team.recruitmentRequirements.maxAverage &&
                              ` - ${team.recruitmentRequirements.maxAverage}`}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-3 text-xs text-gray-500">
                      Captain: {team.captain.firstName} {team.captain.lastName}
                    </div>
                  </div>

                  <div className="ml-4">
                    <Link
                      href={`/teams/${team.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
