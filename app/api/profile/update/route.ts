import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { playerProfiles, users } from "@/drizzle/schema";
import { db } from "@/lib/db";

const updateProfileSchema = z.object({
  usbcMemberId: z.string().min(1),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]),
  bowlingHand: z.enum(["right", "left"]),
  currentAverage: z.string().optional(),
  highGame: z.string().optional(),
  highSeries: z.string().optional(),
  yearsExperience: z.string().optional(),
  preferredTeamTypes: z.array(z.enum(["singles", "doubles", "team"])).optional(),
  preferredCompetitionLevel: z
    .enum(["recreational", "league", "competitive", "professional"])
    .optional(),
  lookingForTeam: z.boolean().optional(),
  openToSubstitute: z.boolean().optional(),
  bio: z.string().optional(),
});

export async function PUT(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawBody = await request.json();
    const body = updateProfileSchema.parse(rawBody);

    // Find the user in our database
    const user = await db.query.users.findFirst({
      where: eq(users.clerkUserId, userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get existing profile
    const existingProfile = await db.query.playerProfiles.findFirst({
      where: eq(playerProfiles.userId, user.id),
    });

    if (!existingProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Check if USBC Member ID is being changed and if it's already in use by someone else
    if (body.usbcMemberId !== existingProfile.usbcMemberId) {
      const conflictingProfile = await db.query.playerProfiles.findFirst({
        where: eq(playerProfiles.usbcMemberId, body.usbcMemberId),
      });

      if (conflictingProfile) {
        return NextResponse.json(
          { error: "This USBC Member ID is already registered" },
          { status: 400 },
        );
      }
    }

    // Update player profile
    const [updatedProfile] = await db
      .update(playerProfiles)
      .set({
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
        updatedAt: new Date(),
      })
      .where(eq(playerProfiles.userId, user.id))
      .returning();

    return NextResponse.json({ success: true, profile: updatedProfile }, { status: 200 });
  } catch (error) {
    console.error("Profile update error:", error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      console.error("Zod validation errors:", error.errors);
      return NextResponse.json(
        { error: "Invalid form data", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to update profile. Please try again." },
      { status: 500 },
    );
  }
}
