import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { playerApplications, teams, users } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { emailTemplates, resend } from "@/lib/email";

const applicationSchema = z.object({
  coverLetter: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> },
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId } = await params;
    const body = applicationSchema.parse(await request.json());

    // Get applicant (current user)
    const applicant = await db.query.users.findFirst({
      where: eq(users.clerkUserId, clerkUserId),
    });

    if (!applicant) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get team with captain
    const team = await db.query.teams.findFirst({
      where: eq(teams.id, teamId),
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Get captain user
    const captain = await db.query.users.findFirst({
      where: eq(users.id, team.captainId),
    });

    if (!captain) {
      return NextResponse.json({ error: "Team captain not found" }, { status: 404 });
    }

    // Check if user is already on the team
    if (team.captainId === applicant.id) {
      return NextResponse.json(
        { error: "You are the captain of this team" },
        { status: 400 },
      );
    }

    // Check if application already exists
    const existingApplication = await db.query.playerApplications.findFirst({
      where: and(
        eq(playerApplications.teamId, teamId),
        eq(playerApplications.applicantUserId, applicant.id),
        eq(playerApplications.status, "pending"),
      ),
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied to this team" },
        { status: 400 },
      );
    }

    // Create application
    const [application] = await db
      .insert(playerApplications)
      .values({
        teamId,
        applicantUserId: applicant.id,
        coverLetter: body.coverLetter || null,
        status: "pending",
      })
      .returning();

    // Send email to captain
    try {
      const emailData = await emailTemplates.applicationReceived(
        captain.email,
        captain.firstName || "Captain",
        applicant.firstName || "Player",
        team.name,
        application!.id,
      );
      await resend.emails.send(emailData);
      console.log("Application notification sent to:", captain.email);
    } catch (emailError) {
      console.error("Failed to send application email:", emailError);
      // Don't fail the application if email fails
    }

    return NextResponse.json({ success: true, application }, { status: 201 });
  } catch (error) {
    console.error("Error submitting application:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}
