import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { type NewTeam, teamMembers, teams, users } from "@/drizzle/schema";
import { db } from "@/lib/db";

const createTeamSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(1, "Team name is required"),
  teamType: z.enum(["singles", "doubles", "team"]),
  genderType: z.enum(["male", "female", "other"]),
  competitionLevel: z.enum(["recreational", "league", "competitive", "professional"]),
  description: z.string().optional(),
  lookingForPlayers: z.boolean().optional(),
  openPositions: z.string().optional(),
  minAverage: z.string().optional(),
  maxAverage: z.string().optional(),
  additionalNotes: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawBody = await request.json();
    const body = createTeamSchema.parse(rawBody);

    // Verify the user exists and matches the authenticated user
    const user = await db.query.users.findFirst({
      where: eq(users.clerkUserId, userId),
    });

    if (!user || user.id !== body.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build recruitment requirements object
    const recruitmentRequirements =
      body.lookingForPlayers && (body.minAverage || body.maxAverage || body.additionalNotes)
        ? {
            minAverage: body.minAverage ? parseInt(body.minAverage) : undefined,
            maxAverage: body.maxAverage ? parseInt(body.maxAverage) : undefined,
            additionalNotes: body.additionalNotes || undefined,
          }
        : null;

    // Create the team
    const teamData: NewTeam = {
      name: body.name,
      captainId: user.id,
      teamType: body.teamType,
      genderType: body.genderType,
      competitionLevel: body.competitionLevel,
      description: body.description || null,
      lookingForPlayers: body.lookingForPlayers || false,
      openPositions: body.openPositions ? parseInt(body.openPositions) : 0,
      recruitmentRequirements,
      currentRosterSize: 1, // Captain is the first member
      isActive: true,
    };

    const [team] = await db.insert(teams).values(teamData).returning();

    if (!team) {
      return NextResponse.json({ error: "Failed to create team" }, { status: 500 });
    }

    // Add captain as first team member
    await db.insert(teamMembers).values({
      teamId: team.id,
      userId: user.id,
      role: "captain",
    });

    return NextResponse.json({ success: true, teamId: team.id }, { status: 201 });
  } catch (error) {
    console.error("Team creation error:", error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      console.error("Zod validation errors:", error.errors);
      return NextResponse.json(
        { error: "Invalid form data", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create team. Please try again." },
      { status: 500 },
    );
  }
}
