import { auth } from "@clerk/nextjs/server";
import { and, count, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { teams } from "@/drizzle/schema/teams";
import { requirePermission } from "@/lib/admin/permissions";
import { db } from "@/lib/db";

export async function GET(_request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requirePermission(clerkUserId, "view_analytics");

    const [totalTeamsResult, activeTeamsResult, lookingForPlayersResult, flaggedTeamsResult] =
      await Promise.all([
        db.select({ count: count() }).from(teams),
        db.select({ count: count() }).from(teams).where(eq(teams.isActive, true)),
        db
          .select({ count: count() })
          .from(teams)
          .where(and(eq(teams.isActive, true), eq(teams.lookingForPlayers, true))),
        db.select({ count: count() }).from(teams).where(eq(teams.flaggedForReview, true)),
      ]);

    const data = {
      totalTeams: totalTeamsResult[0]?.count ?? 0,
      activeTeams: activeTeamsResult[0]?.count ?? 0,
      lookingForPlayers: lookingForPlayersResult[0]?.count ?? 0,
      flaggedTeams: flaggedTeamsResult[0]?.count ?? 0,
    };

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching team stats:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch team stats" },
      { status: 500 },
    );
  }
}
