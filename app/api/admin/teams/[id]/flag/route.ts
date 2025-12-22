import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { teams } from "@/drizzle/schema/teams";
import { getClerkUser } from "@/lib/admin/clerk-integration";
import { logAdminAction } from "@/lib/admin/audit-logger";
import { requirePermission } from "@/lib/admin/permissions";
import { db } from "@/lib/db";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId: adminClerkUserId } = await auth();
    if (!adminClerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requirePermission(adminClerkUserId, "moderate_teams");

    const { id: teamId } = await params;

    // Get team info
    const [team] = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Get admin info
    const adminUser = await getClerkUser(adminClerkUserId);
    const adminName =
      [adminUser.firstName, adminUser.lastName].filter(Boolean).join(" ") ||
      adminUser.emailAddresses[0]?.emailAddress ||
      "Unknown";

    const body = (await request.json()) as { reason?: string };
    const reason = body.reason || "No reason provided";

    // Flag team
    await db
      .update(teams)
      .set({
        flaggedForReview: true,
        flaggedReason: reason,
        flaggedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(teams.id, teamId));

    // Log action
    await logAdminAction({
      adminClerkUserId,
      adminName,
      actionType: "team_flagged",
      targetType: "team",
      targetId: teamId,
      targetDescription: `Team: ${team.name}`,
      reason,
      newValue: { flagged: true, reason },
    });

    return NextResponse.json({ success: true, message: "Team flagged successfully" });
  } catch (error) {
    console.error("Error flagging team:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to flag team" },
      { status: 500 },
    );
  }
}
