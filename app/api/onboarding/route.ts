import { auth, clerkClient } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { z } from "zod"

import { type NewPlayerProfile, playerProfiles, privacyConsents, users } from "@/drizzle/schema"
import { db } from "@/lib/db"
import { emailTemplates, resend } from "@/lib/email"

const onboardingSchema = z.object({
  usbcMemberId: z.string().min(1),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]),
  bowlingHand: z.enum(["right", "left"]),
  currentAverage: z.string().optional(),
  highGame: z.string().optional(),
  highSeries: z.string().optional(),
  yearsExperience: z.string().optional(),
  preferredTeamTypes: z.array(z.enum(["singles", "doubles", "team"])).optional(),
  preferredTeamGenderTypes: z.array(z.enum(["male", "female", "mixed"])).optional(),
  preferredCompetitionLevel: z
    .enum(["recreational", "league", "competitive", "professional"])
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  lookingForTeam: z.boolean().optional(),
  openToSubstitute: z.boolean().optional(),
  bio: z.string().optional(),
  // Privacy & Legal
  acceptPrivacyPolicy: z.boolean(),
  acceptTermsOfService: z.boolean(),
  optInMarketing: z.boolean().optional(),
})

export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rawBody = await request.json()
    const body = onboardingSchema.parse(rawBody)

    // Find the user in our database, or create if doesn't exist (handles dev environment)
    let user = await db.query.users.findFirst({
      where: eq(users.clerkUserId, userId),
    })

    if (!user) {
      // User doesn't exist in our DB yet (can happen in dev when webhook doesn't fire)
      // Get user info from Clerk and create the record
      const client = await clerkClient()
      const clerkUser = await client.users.getUser(userId)

      const [newUser] = await db
        .insert(users)
        .values({
          clerkUserId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          firstName: clerkUser.firstName || null,
          lastName: clerkUser.lastName || null,
          imageUrl: clerkUser.imageUrl || null,
        })
        .returning()

      user = newUser
    }

    // Check if USBC Member ID is already in use
    const existingProfile = await db.query.playerProfiles.findFirst({
      where: eq(playerProfiles.usbcMemberId, body.usbcMemberId),
    })

    if (existingProfile) {
      return NextResponse.json({ error: "This USBC Member ID is already registered" }, { status: 400 })
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
      preferredTeamGenderTypes: body.preferredTeamGenderTypes || [],
      preferredCompetitionLevel: body.preferredCompetitionLevel || null,
      lookingForTeam: body.lookingForTeam || false,
      openToSubstitute: body.openToSubstitute || false,
      bio: body.bio || null,
      profileComplete: true,
    }

    // Log privacy consents
    const ipAddress = request.headers.get("x-forwarded-for") || null
    const userAgent = request.headers.get("user-agent") || null

    const profile = await db.transaction(async (tx) => {
      const [createdProfile] = await tx.insert(playerProfiles).values(profileData).returning()

      await tx.insert(privacyConsents).values([
        {
          userId: user!.id,
          consentType: "privacy_policy",
          consentVersion: "1.0",
          accepted: true,
          ipAddress,
          userAgent,
        },
        {
          userId: user!.id,
          consentType: "terms_of_service",
          consentVersion: "1.0",
          accepted: true,
          ipAddress,
          userAgent,
        },
      ])

      await tx
        .update(users)
        .set({
          privacyPolicyAcceptedAt: new Date(),
          privacyPolicyVersion: "1.0",
          termsAcceptedAt: new Date(),
          termsVersion: "1.0",
          marketingEmailsOptIn: body.optInMarketing || false,
        })
        .where(eq(users.id, user!.id))

      return createdProfile
    })

    // Send welcome email
    try {
      const emailData = await emailTemplates.welcome(user!.email, user!.firstName || "Bowler")
      await resend.emails.send(emailData)
    } catch (emailError) {
      // Log error but don't fail onboarding if email fails
      console.error("Failed to send welcome email:", emailError)
    }

    return NextResponse.json({ success: true, profile }, { status: 201 })
  } catch (error) {
    console.error("Onboarding error:", error)

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid form data", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to create profile. Please try again." }, { status: 500 })
  }
}
