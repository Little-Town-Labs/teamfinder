import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { playerProfiles, users } from "@/drizzle/schema";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Find the user in our database
    const user = await db.query.users.findFirst({
      where: eq(users.clerkUserId, userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if USBC Member ID is already in use
    const existingProfile = await db.query.playerProfiles.findFirst({
      where: eq(playerProfiles.usbcMemberId, body.usbcMemberId),
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: "This USBC Member ID is already registered" },
        { status: 400 },
      );
    }

    // Create player profile
    const [profile] = await db
      .insert(playerProfiles)
      .values({
        userId: user.id,
        usbcMemberId: body.usbcMemberId,
        gender: body.gender,
        bowlingHand: body.bowlingHand,
        currentAverage: body.currentAverage ? parseInt(body.currentAverage) : null,
        highGame: body.highGame ? parseInt(body.highGame) : null,
        highSeries: body.highSeries ? parseInt(body.highSeries) : null,
        yearsExperience: body.yearsExperience ? parseInt(body.yearsExperience) : null,
        preferredTeamTypes: body.preferredTeamTypes || [],
        preferredCompetitionLevel: body.preferredCompetitionLevel || null,
        lookingForTeam: body.lookingForTeam || false,
        openToSubstitute: body.openToSubstitute || false,
        bio: body.bio || null,
        profileComplete: true,
      })
      .returning();

    return NextResponse.json({ success: true, profile }, { status: 201 });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to create profile. Please try again." },
      { status: 500 },
    );
  }
}
