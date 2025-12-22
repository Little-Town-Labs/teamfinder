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

    const body = (await request.json()) as { status: string; reviewNotes?: string };
    const { status, reviewNotes } = body;

    if (!["pending", "investigating", "resolved", "dismissed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const reportStatus = status as "pending" | "investigating" | "resolved" | "dismissed";

    const previousStatus = report.status;

    // Update report status
    await db
      .update(reports)
      .set({
        status: reportStatus,
        reviewNotes: reviewNotes || report.reviewNotes,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(reports.id, reportId));

    // Log action
    await logAdminAction({
      adminClerkUserId,
      adminName,
      actionType: "report_reviewed",
      targetType: "report",
      targetId: reportId,
      targetDescription: `Report: ${report.reportType} - ${report.reason}`,
      reason: reviewNotes || `Status changed from ${previousStatus} to ${status}`,
      previousValue: { status: previousStatus },
      newValue: { status },
    });

    return NextResponse.json({ success: true, message: "Report status updated successfully" });
  } catch (error) {
    console.error("Error updating report status:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update report status" },
      { status: 500 },
    );
  }
}
