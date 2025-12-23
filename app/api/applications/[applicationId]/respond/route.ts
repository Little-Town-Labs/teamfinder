import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { playerApplications, teamMembers, teams, users } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { emailTemplates, resend } from "@/lib/email";

const responseSchema = z.object({
  status: z.enum(["accepted", "declined"]),
  message: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> },
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { applicationId } = await params;
    const body = responseSchema.parse(await request.json());

    // Get captain (current user)
    const captain = await db.query.users.findFirst({
      where: eq(users.clerkUserId, clerkUserId),
    });

    if (!captain) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get application
    const application = await db.query.playerApplications.findFirst({
      where: eq(playerApplications.id, applicationId),
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Get team
    const team = await db.query.teams.findFirst({
      where: eq(teams.id, application.teamId),
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Verify captain ownership
    if (team.captainId !== captain.id) {
      return NextResponse.json(
        { error: "Only team captain can respond to applications" },
        { status: 403 },
      );
    }

    // Check if already responded
    if (application.status !== "pending") {
      return NextResponse.json({ error: "Application already processed" }, { status: 400 });
    }

    // Get applicant
    const applicant = await db.query.users.findFirst({
      where: eq(users.id, application.applicantUserId),
    });

    if (!applicant) {
      return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
    }

    // Update application status
    const [updatedApplication] = await db
      .update(playerApplications)
      .set({
        status: body.status,
        reviewedByUserId: captain.id,
        reviewedAt: new Date(),
        message: body.message || null,
      })
      .where(eq(playerApplications.id, applicationId))
      .returning();

    // If accepted, add player to team
    if (body.status === "accepted") {
      await db.insert(teamMembers).values({
        teamId: application.teamId,
        userId: application.applicantUserId,
        role: "member",
        joinedAt: new Date(),
      });
    }

    // Send email to applicant
    try {
      const emailData = await emailTemplates.applicationStatusUpdate(
        applicant.email,
        applicant.firstName || "Bowler",
        team.name,
        body.status,
      );
      await resend.emails.send(emailData);
      console.log(`Application ${body.status} email sent to:`, applicant.email);
    } catch (emailError) {
      console.error("Failed to send status update email:", emailError);
      // Don't fail the response if email fails
    }

    return NextResponse.json({ success: true, application: updatedApplication });
  } catch (error) {
    console.error("Error responding to application:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to respond to application" }, { status: 500 });
  }
}
