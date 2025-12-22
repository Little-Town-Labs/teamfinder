import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { teams } from "@/drizzle/schema/teams";
import { logTeamDeletion } from "@/lib/admin/audit-logger";
import { getClerkUser } from "@/lib/admin/clerk-integration";
import { requirePermission } from "@/lib/admin/permissions";
import { db } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId: adminClerkUserId } = await auth();
    if (!adminClerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requirePermission(adminClerkUserId, "delete_teams");

    const { id: teamId } = await params;

    // Get team info before deletion
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

    // Delete team (cascade will handle related records)
    await db.delete(teams).where(eq(teams.id, teamId));

    // Log action
    await logTeamDeletion({
      adminClerkUserId,
      adminName,
      teamId,
      teamName: team.name,
      reason,
    });

    return NextResponse.json({ success: true, message: "Team deleted successfully" });
  } catch (error) {
    console.error("Error deleting team:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete team" },
      { status: 500 },
    );
  }
}
