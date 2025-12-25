import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import {
  activityLogs,
  messages,
  playerProfiles,
  teamMembers,
  users,
} from "@/drizzle/schema";
import { db } from "@/lib/db";

/**
 * GET /api/user/export-data
 * Export all user data in JSON format (GDPR Right to Access)
 */
export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await db.query.users.findFirst({
      where: eq(users.clerkUserId, clerkUserId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Gather all user data
    const [profile, teams, userMessages, activities, consents] = await Promise.all([
      db.query.playerProfiles.findFirst({
        where: eq(playerProfiles.userId, user.id),
      }),
      db.query.teamMembers.findMany({
        where: eq(teamMembers.userId, user.id),
        with: {
          team: true,
        },
      }),
      db.query.messages.findMany({
        where: eq(messages.senderId, user.id),
      }),
      db.query.activityLogs.findMany({
        where: eq(activityLogs.userId, user.id),
      }),
      db.query.privacyConsents.findMany({
        where: eq(users.id, user.id),
      }),
    ]);

    // Compile export package
    const exportData = {
      exportDate: new Date().toISOString(),
      exportVersion: "1.0",
      personalInformation: {
        id: user.id,
        clerkUserId: user.clerkUserId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      privacySettings: {
        privacyPolicyAcceptedAt: user.privacyPolicyAcceptedAt,
        privacyPolicyVersion: user.privacyPolicyVersion,
        termsAcceptedAt: user.termsAcceptedAt,
        termsVersion: user.termsVersion,
        cookieConsentGiven: user.cookieConsentGiven,
        marketingEmailsOptIn: user.marketingEmailsOptIn,
      },
      bowlingProfile: profile || null,
      teams: teams || [],
      messages: userMessages || [],
      activityHistory: activities || [],
      privacyConsents: consents || [],
    };

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="teamfinder-data-export-${user.id}.json"`,
      },
    });
  } catch (error) {
    console.error("Error exporting user data:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
