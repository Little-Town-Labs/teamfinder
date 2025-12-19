import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";

import { Button } from "@/components/Button/Button";
import { Header } from "@/components/Header/Header";
import { teamMembers, teams, users } from "@/drizzle/schema";
import type { TeamMember, User } from "@/drizzle/schema";

import { db } from "@/lib/db";

export default async function TeamDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get team with captain info
  const team = await db.query.teams.findFirst({
    where: eq(teams.id, id),
    with: {
      captain: true,
    },
  });

  if (!team) {
    notFound();
  }

  // Get team members
  const members = (await db.query.teamMembers.findMany({
    where: eq(teamMembers.teamId, id),
    with: {
      user: true,
    },
  })) as Array<TeamMember & { user: User }>;

  // Check if current user is team captain
  const currentUser = await db.query.users.findFirst({
    where: eq(users.clerkUserId, userId),
  });

  const isCaptain = currentUser?.id === team.captainId;

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-(--breakpoint-xl) px-4 py-8 lg:py-16">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl dark:text-white">
              {team.name}
            </h1>
            <p className="font-light text-gray-500 md:text-lg dark:text-gray-400">
              {team.lookingForPlayers ? "Now recruiting players" : "Team roster complete"}
            </p>
          </div>
        </div>
      </section>

      {/* Success Message */}
      <section className="bg-green-50 dark:bg-green-900">
        <div className="mx-auto max-w-(--breakpoint-xl) px-4 py-4 lg:px-6">
          <p className="text-center font-medium text-green-800 dark:text-green-200">
            Team created successfully! You are now the team captain.
          </p>
        </div>
      </section>

      {/* Team Info Section */}
      <section className="bg-gray-50 dark:bg-gray-800">
        <div className="mx-auto max-w-(--breakpoint-xl) px-4 py-8 sm:py-16 lg:px-6">
          <div className="mb-8 text-center lg:mb-16">
            <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Team Details
            </h2>
          </div>

          <div className="mx-auto max-w-5xl rounded-lg bg-white p-8 shadow-md dark:bg-gray-900">
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-4 text-xl font-bold dark:text-white">Team Information</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Team Type</dt>
                    <dd className="text-sm capitalize text-gray-900 dark:text-white">{team.teamType}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender Type</dt>
                    <dd className="text-sm capitalize text-gray-900 dark:text-white">
                      {team.genderType === "male"
                        ? "Men's Team"
                        : team.genderType === "female"
                          ? "Women's Team"
                          : "Mixed Team"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Competition Level</dt>
                    <dd className="text-sm capitalize text-gray-900 dark:text-white">{team.competitionLevel}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Roster Size</dt>
                    <dd className="text-sm text-gray-900 dark:text-white">
                      {team.currentRosterSize} / {team.maxRosterSize} members
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="mb-4 text-xl font-bold dark:text-white">Recruitment Status</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Looking for Players</dt>
                    <dd className="text-sm text-gray-900 dark:text-white">
                      {team.lookingForPlayers ? (
                        <span className="text-green-600 dark:text-green-400">Yes</span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">No</span>
                      )}
                    </dd>
                  </div>
                  {team.lookingForPlayers && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Open Positions</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">{team.openPositions}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {team.description && (
              <div className="border-t pt-6 dark:border-gray-700">
                <h3 className="mb-2 text-xl font-bold dark:text-white">About the Team</h3>
                <p className="text-gray-700 dark:text-gray-300">{team.description}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Team Members Section */}
      <section className="bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-(--breakpoint-xl) px-4 py-8 sm:py-16 lg:px-6">
          <div className="mb-8 text-center lg:mb-16">
            <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Team Members
            </h2>
          </div>

          <div className="mx-auto max-w-3xl space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded bg-gray-50 p-4 dark:bg-gray-800"
              >
                <div className="flex items-center space-x-3">
                  {member.user.imageUrl && (
                    <Image
                      src={member.user.imageUrl}
                      alt={member.user.firstName || "User"}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {member.user.firstName} {member.user.lastName}
                    </p>
                    <p className="text-xs capitalize text-gray-500 dark:text-gray-400">{member.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Captain Actions Section */}
      {isCaptain && (
        <section className="bg-blue-700 dark:bg-blue-800">
          <div className="mx-auto max-w-(--breakpoint-xl) px-4 py-8 text-center sm:py-16 lg:px-6">
            <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-white">
              Next Steps
            </h2>
            <p className="mb-8 font-light text-blue-100 sm:text-xl">
              As the team captain, you can manage your team, invite players, and update team information.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button href="/dashboard" className="bg-white text-blue-700 border-white hover:enabled:bg-gray-100">
                Invite Players
              </Button>
              <Button href="/dashboard" intent="secondary" className="border-white text-white hover:enabled:bg-blue-600">
                Edit Team
              </Button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
