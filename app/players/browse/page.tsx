import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import Image from "next/image";
import { redirect } from "next/navigation";

import { Header } from "@/components/Header/Header";
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
    <>
      <Header />

      {/* Hero Section */}
      <section className="bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-(--breakpoint-xl) px-4 py-8 sm:py-16 lg:px-6">
          <div className="mb-8 text-center lg:mb-16">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Find Players
            </h1>
            <p className="font-light text-gray-500 sm:text-xl dark:text-gray-400">
              Discover talented bowlers looking for teams
            </p>
          </div>

          {/* Filters Section */}
          <div className="mx-auto max-w-5xl rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Filter Players</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <label htmlFor="minAverage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Min Average
                </label>
                <input
                  type="number"
                  id="minAverage"
                  placeholder="e.g., 150"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
              </div>

              <div>
                <label htmlFor="maxAverage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Max Average
                </label>
                <input
                  type="number"
                  id="maxAverage"
                  placeholder="e.g., 200"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
              </div>

              <div>
                <label htmlFor="bowlingHand" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bowling Hand
                </label>
                <select
                  id="bowlingHand"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All</option>
                  <option value="right">Right</option>
                  <option value="left">Left</option>
                </select>
              </div>

              <div className="flex items-end">
                <button className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Players Grid Section */}
      <section className="bg-gray-50 dark:bg-gray-800">
        <div className="mx-auto max-w-(--breakpoint-xl) px-4 py-8 sm:py-16 lg:px-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {availablePlayers.length === 0 ? (
            <div className="col-span-full rounded-lg bg-white p-8 text-center shadow dark:bg-gray-900">
              <p className="text-gray-500 dark:text-gray-400">No players are currently looking for teams.</p>
              <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">Check back later!</p>
            </div>
          ) : (
            availablePlayers.map((player) => (
              <div
                key={player.id}
                className="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-lg dark:bg-gray-900"
              >
                <div className="mb-4 flex items-center gap-3">
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
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {player.user.firstName} {player.user.lastName}
                    </h3>
                    <div className="mt-1 flex gap-2">
                      {player.lookingForTeam && (
                        <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          Looking for Team
                        </span>
                      )}
                      {player.openToSubstitute && (
                        <span className="rounded bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                          Open to Sub
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <dl className="mb-4 space-y-2">
                  {player.currentAverage && (
                    <div className="flex justify-between text-sm">
                      <dt className="text-gray-500 dark:text-gray-400">Average:</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">{player.currentAverage}</dd>
                    </div>
                  )}
                  {player.highGame && (
                    <div className="flex justify-between text-sm">
                      <dt className="text-gray-500 dark:text-gray-400">High Game:</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">{player.highGame}</dd>
                    </div>
                  )}
                  {player.yearsExperience && (
                    <div className="flex justify-between text-sm">
                      <dt className="text-gray-500 dark:text-gray-400">Experience:</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">
                        {player.yearsExperience} {player.yearsExperience === 1 ? "year" : "years"}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-500 dark:text-gray-400">Hand:</dt>
                    <dd className="font-medium capitalize text-gray-900 dark:text-white">{player.bowlingHand}</dd>
                  </div>
                  {player.preferredCompetitionLevel && (
                    <div className="flex justify-between text-sm">
                      <dt className="text-gray-500 dark:text-gray-400">Level:</dt>
                      <dd className="font-medium capitalize text-gray-900 dark:text-white">
                        {player.preferredCompetitionLevel}
                      </dd>
                    </div>
                  )}
                </dl>

                {player.preferredTeamTypes && player.preferredTeamTypes.length > 0 && (
                  <div className="mb-4">
                    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Preferred Team Types:</p>
                    <div className="flex flex-wrap gap-1">
                      {player.preferredTeamTypes.map((type) => (
                        <span
                          key={type}
                          className="rounded bg-gray-100 px-2 py-1 text-xs capitalize text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {player.bio && (
                  <p className="mb-4 line-clamp-3 text-sm text-gray-700 dark:text-gray-300">{player.bio}</p>
                )}

                <div className="border-t pt-4 dark:border-gray-700">
                  <button className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
                    Send Message
                  </button>
                </div>

                {player.usbcVerified && (
                  <div className="mt-2 text-center">
                    <span className="text-xs text-green-600 dark:text-green-400">✓ USBC Verified</span>
                  </div>
                )}
              </div>
            ))
          )}
          </div>
        </div>
      </section>
    </>
  );
}
