import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";

import { playerProfiles, teams, users } from "@/drizzle/schema";
import type { Team, User } from "@/drizzle/schema";

import { db } from "@/lib/db";
import { FilterableTeamsList } from "./FilterableTeamsList";

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
        <FilterableTeamsList teams={availableTeams} />
      </main>
    </div>
  );
}
