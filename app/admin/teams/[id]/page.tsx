import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { teams } from "@/drizzle/schema/teams";
import { users } from "@/drizzle/schema/users";
import { requirePermission } from "@/lib/admin/permissions";
import { db } from "@/lib/db";
import { TeamDetailClient } from "./TeamDetailClient";

interface TeamDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  const { userId: adminClerkUserId } = await auth();
  await requirePermission(adminClerkUserId!, "view_teams");

  const { id: teamId } = await params;

  // Fetch team with captain info
  const [teamData] = await db
    .select({
      // Team fields
      id: teams.id,
      name: teams.name,
      description: teams.description,
      teamType: teams.teamType,
      genderType: teams.genderType,
      competitionLevel: teams.competitionLevel,
      isActive: teams.isActive,
      flaggedForReview: teams.flaggedForReview,
      flaggedReason: teams.flaggedReason,
      flaggedAt: teams.flaggedAt,
      moderationNotes: teams.moderationNotes,
      moderatedAt: teams.moderatedAt,
      currentRosterSize: teams.currentRosterSize,
      maxRosterSize: teams.maxRosterSize,
      lookingForPlayers: teams.lookingForPlayers,
      teamAverage: teams.teamAverage,
      currentStanding: teams.currentStanding,
      seasonsActive: teams.seasonsActive,
      achievements: teams.achievements,
      createdAt: teams.createdAt,
      updatedAt: teams.updatedAt,
      // Captain fields
      captainId: users.id,
      captainFirstName: users.firstName,
      captainLastName: users.lastName,
      captainEmail: users.email,
      captainClerkUserId: users.clerkUserId,
    })
    .from(teams)
    .leftJoin(users, eq(teams.captainId, users.id))
    .where(eq(teams.id, teamId))
    .limit(1);

  if (!teamData) {
    notFound();
  }

  return <TeamDetailClient teamData={teamData} adminClerkUserId={adminClerkUserId!} />;
}
