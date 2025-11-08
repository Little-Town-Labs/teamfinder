import { auth, clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { type NewPlayerProfile, playerProfiles, users } from "@/drizzle/schema";
import { db } from "@/lib/db";

const onboardingSchema = z.object({
  usbcMemberId: z.string().min(1),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]),
  bowlingHand: z.enum(["right", "left"]),
  currentAverage: z.string().optional(),
  highGame: z.string().optional(),
  highSeries: z.string().optional(),
  yearsExperience: z.string().optional(),
  preferredTeamTypes: z.array(z.enum(["singles", "doubles", "team"])).optional(),
  preferredCompetitionLevel: z.enum(["recreational", "league", "competitive", "professional"]).optional(),
  lookingForTeam: z.boolean().optional(),
  openToSubstitute: z.boolean().optional(),
  bio: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawBody = await request.json();
    const body = onboardingSchema.parse(rawBody);

    // Find the user in our database, or create if doesn't exist (handles dev environment)
    let user = await db.query.users.findFirst({
      where: eq(users.clerkUserId, userId),
    });

    if (!user) {
      // User doesn't exist in our DB yet (can happen in dev when webhook doesn't fire)
      // Get user info from Clerk and create the record
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);

      const [newUser] = await db
        .insert(users)
        .values({
          clerkUserId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          firstName: clerkUser.firstName || null,
          lastName: clerkUser.lastName || null,
          imageUrl: clerkUser.imageUrl || null,
        })
        .returning();

      user = newUser;
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
    const profileData: NewPlayerProfile = {
      userId: user!.id,
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
    };

    const [profile] = await db
      .insert(playerProfiles)
      .values(profileData)
      .returning();

    return NextResponse.json({ success: true, profile }, { status: 201 });
  } catch (error) {
    console.error("Onboarding error:", error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid form data", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create profile. Please try again." },
      { status: 500 },
    );
  }
}
