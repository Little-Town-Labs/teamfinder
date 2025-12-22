import { auth } from "@clerk/nextjs/server";
import { count, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { reports } from "@/drizzle/schema/reports";
import { requirePermission } from "@/lib/admin/permissions";
import { db } from "@/lib/db";

export async function GET(_request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requirePermission(clerkUserId, "view_analytics");

    const [pendingResult, investigatingResult, resolvedResult, dismissedResult] =
      await Promise.all([
        db.select({ count: count() }).from(reports).where(eq(reports.status, "pending")),
        db.select({ count: count() }).from(reports).where(eq(reports.status, "investigating")),
        db.select({ count: count() }).from(reports).where(eq(reports.status, "resolved")),
        db.select({ count: count() }).from(reports).where(eq(reports.status, "dismissed")),
      ]);

    const data = {
      pending: pendingResult[0]?.count ?? 0,
      investigating: investigatingResult[0]?.count ?? 0,
      resolved: resolvedResult[0]?.count ?? 0,
      dismissed: dismissedResult[0]?.count ?? 0,
    };

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching report stats:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch report stats" },
      { status: 500 },
    );
  }
}
