import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { Header } from "@/components/Header/Header";
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
    <>
      <Header />
      <section className="bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-(--breakpoint-xl) px-4 py-8 sm:py-16 lg:px-6">
          <div className="mb-8 text-center lg:mb-16">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Browse Teams
            </h1>
            <p className="font-light text-gray-500 sm:text-xl dark:text-gray-400">
              Find the perfect team for your bowling journey
            </p>
          </div>
          <FilterableTeamsList teams={availableTeams} />
        </div>
      </section>
    </>
  );
}
