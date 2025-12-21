import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { bowlingCenters, leagues, playerProfiles, teams } from "@/drizzle/schema";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Get the bowling center
    const center = await db.query.bowlingCenters.findFirst({
      where: eq(bowlingCenters.id, id),
    });

    if (!center) {
      return NextResponse.json({ error: "Bowling center not found" }, { status: 404 });
    }

    // Get associated teams (limit to 10, eager load captain)
    const associatedTeams = await db.query.teams.findMany({
      where: eq(teams.homeBowlingCenterId, id),
      limit: 10,
      with: {
        captain: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Get total teams count
    const teamsCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(teams)
      .where(eq(teams.homeBowlingCenterId, id));
    const teamsCount = teamsCountResult[0]?.count ?? 0;

    // Get associated leagues (limit to 10)
    const associatedLeagues = await db.query.leagues.findMany({
      where: eq(leagues.bowlingCenterId, id),
      limit: 10,
    });

    // Get total leagues count
    const leaguesCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(leagues)
      .where(eq(leagues.bowlingCenterId, id));
    const leaguesCount = leaguesCountResult[0]?.count ?? 0;

    // Get associated player profiles (limit to 10, eager load user)
    const associatedPlayers = await db.query.playerProfiles.findMany({
      where: eq(playerProfiles.homeBowlingCenterId, id),
      limit: 10,
      with: {
        user: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Get total player profiles count
    const playersCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(playerProfiles)
      .where(eq(playerProfiles.homeBowlingCenterId, id));
    const playersCount = playersCountResult[0]?.count ?? 0;

    return NextResponse.json({
      center,
      teams: {
        items: associatedTeams,
        total: teamsCount,
      },
      leagues: {
        items: associatedLeagues,
        total: leaguesCount,
      },
      players: {
        items: associatedPlayers,
        total: playersCount,
      },
    });
  } catch (error) {
    console.error("Error fetching bowling center:", error);
    return NextResponse.json({ error: "Failed to fetch bowling center" }, { status: 500 });
  }
}
