import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { reports } from "@/drizzle/schema/reports";
import { logAdminAction } from "@/lib/admin/audit-logger";
import { getClerkUser } from "@/lib/admin/clerk-integration";
import { requirePermission } from "@/lib/admin/permissions";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId: adminClerkUserId } = await auth();
    if (!adminClerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requirePermission(adminClerkUserId, "resolve_reports");

    const { id: reportId } = await params;

    // Get report info before update
    const [report] = await db.select().from(reports).where(eq(reports.id, reportId)).limit(1);
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Get admin info
    const adminUser = await getClerkUser(adminClerkUserId);
    const adminName =
      [adminUser.firstName, adminUser.lastName].filter(Boolean).join(" ") ||
      adminUser.emailAddresses[0]?.emailAddress ||
      "Unknown";

    const body = (await request.json()) as { reviewNotes?: string };
    const { reviewNotes } = body;

    if (!reviewNotes) {
      return NextResponse.json({ error: "Review notes are required" }, { status: 400 });
    }

    const previousStatus = report.status;

    // Dismiss report
    await db
      .update(reports)
      .set({
        status: "dismissed",
        reviewNotes,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(reports.id, reportId));

    // Log action
    await logAdminAction({
      adminClerkUserId,
      adminName,
      actionType: "report_dismissed",
      targetType: "report",
      targetId: reportId,
      targetDescription: `Report: ${report.reportType} - ${report.reason}`,
      reason: reviewNotes,
      previousValue: { status: previousStatus },
      newValue: { status: "dismissed" },
    });

    return NextResponse.json({ success: true, message: "Report dismissed successfully" });
  } catch (error) {
    console.error("Error dismissing report:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to dismiss report" },
      { status: 500 },
    );
  }
}
