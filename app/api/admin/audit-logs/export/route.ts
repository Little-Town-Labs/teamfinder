import { auth } from "@clerk/nextjs/server";
import { desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";

import { adminActions } from "@/drizzle/schema/admin-actions";
import { requirePermission } from "@/lib/admin/permissions";
import { db } from "@/lib/db";

export async function POST(_request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requirePermission(clerkUserId, "view_audit_logs");

    // Fetch all audit logs (limit to 10000 for performance)
    const logs = await db
      .select()
      .from(adminActions)
      .orderBy(desc(adminActions.createdAt))
      .limit(10000);

    // Format for CSV
    const csvData = logs.map((log) => ({
      Timestamp: log.createdAt.toISOString(),
      Admin: log.adminName,
      "Admin Role": log.adminRole,
      Action: log.actionType,
      "Target Type": log.targetType,
      "Target ID": log.targetId,
      "Target Description": log.targetDescription,
      Reason: log.reason || "",
      "IP Address": log.ipAddress,
      "User Agent": log.userAgent,
    }));

    const csv = Papa.unparse(csvData);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="audit-logs-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting audit logs:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to export audit logs" },
      { status: 500 },
    );
  }
}
