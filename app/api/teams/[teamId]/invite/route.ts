import { auth } from "@clerk/nextjs/server"
import { and, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { teamInvitations, teams, users } from "@/drizzle/schema"
import { db } from "@/lib/db"
import { emailTemplates, resend } from "@/lib/email"

const inviteSchema = z.object({
  invitedUserId: z.string().uuid(),
  message: z.string().optional(),
})

export async function POST(request: NextRequest, { params }: { params: Promise<{ teamId: string }> }) {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { teamId } = await params
    const body = inviteSchema.parse(await request.json())

    // Get captain (current user)
    const captain = await db.query.users.findFirst({
      where: eq(users.clerkUserId, clerkUserId),
    })

    if (!captain) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get team and verify captain ownership
    const team = await db.query.teams.findFirst({
      where: eq(teams.id, teamId),
    })

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    if (team.captainId !== captain.id) {
      return NextResponse.json({ error: "Only team captain can send invitations" }, { status: 403 })
    }

    // Get invited player
    const invitedPlayer = await db.query.users.findFirst({
      where: eq(users.id, body.invitedUserId),
    })

    if (!invitedPlayer) {
      return NextResponse.json({ error: "Invited user not found" }, { status: 404 })
    }

    // Check if invitation already exists
    const existingInvitation = await db.query.teamInvitations.findFirst({
      where: and(
        eq(teamInvitations.teamId, teamId),
        eq(teamInvitations.invitedUserId, body.invitedUserId),
        eq(teamInvitations.status, "pending")
      ),
    })

    if (existingInvitation) {
      return NextResponse.json({ error: "Invitation already sent to this player" }, { status: 400 })
    }

    // Create invitation
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 14) // 14 days expiry

    const [invitation] = await db
      .insert(teamInvitations)
      .values({
        teamId,
        invitedUserId: body.invitedUserId,
        invitedByUserId: captain.id,
        message: body.message || null,
        status: "pending",
        expiresAt,
      })
      .returning()

    // Send email
    try {
      const emailData = await emailTemplates.teamInvitation(
        invitedPlayer.email,
        invitedPlayer.firstName || "Bowler",
        team.name,
        captain.firstName || "Team Captain",
        invitation!.id
      )
      await resend.emails.send(emailData)
    } catch (emailError) {
      console.error("Failed to send invitation email:", emailError)
      // Don't fail the invitation if email fails
    }

    return NextResponse.json({ success: true, invitation }, { status: 201 })
  } catch (error) {
    console.error("Error sending invitation:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to send invitation" }, { status: 500 })
  }
}
