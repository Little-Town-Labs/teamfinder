import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { teamMembers, teams, users } from "@/drizzle/schema";
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
  const members = await db.query.teamMembers.findMany({
    where: eq(teamMembers.teamId, id),
    with: {
      user: true,
    },
  });

  // Check if current user is team captain
  const currentUser = await db.query.users.findFirst({
    where: eq(users.clerkUserId, userId),
  });

  const isCaptain = currentUser?.id === team.captainId;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
            <Link
              href="/dashboard"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-6">
          Team created successfully! You are now the team captain.
        </div>

        {/* Team Info */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Details</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Team Type</dt>
                  <dd className="text-sm text-gray-900 capitalize">{team.teamType}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Gender Type</dt>
                  <dd className="text-sm text-gray-900 capitalize">
                    {team.genderType === "male"
                      ? "Men's Team"
                      : team.genderType === "female"
                        ? "Women's Team"
                        : "Mixed Team"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Competition Level</dt>
                  <dd className="text-sm text-gray-900 capitalize">{team.competitionLevel}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Roster Size</dt>
                  <dd className="text-sm text-gray-900">
                    {team.currentRosterSize} / {team.maxRosterSize} members
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recruitment Status</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Looking for Players</dt>
                  <dd className="text-sm text-gray-900">
                    {team.lookingForPlayers ? (
                      <span className="text-green-600">Yes</span>
                    ) : (
                      <span className="text-gray-500">No</span>
                    )}
                  </dd>
                </div>
                {team.lookingForPlayers && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Open Positions</dt>
                    <dd className="text-sm text-gray-900">{team.openPositions}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {team.description && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">About the Team</h3>
              <p className="text-sm text-gray-700">{team.description}</p>
            </div>
          )}
        </div>

        {/* Team Members */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h3>
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  {member.user.imageUrl && (
                    <img
                      src={member.user.imageUrl}
                      alt={member.user.firstName || "User"}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {member.user.firstName} {member.user.lastName}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        {isCaptain && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Next Steps</h3>
            <p className="text-sm text-gray-700 mb-4">
              As the team captain, you can now manage your team, invite players, and update team
              information.
            </p>
            <div className="space-x-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Invite Players
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                Edit Team
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
