import { auth } from "@clerk/nextjs/server";
import { count, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";

import { bowlingCenters } from "@/drizzle/schema/bowling-centers";
import { reports } from "@/drizzle/schema/reports";
import { teams } from "@/drizzle/schema/teams";
import { getAllUsers } from "@/lib/admin/clerk-integration";
import { requirePermission } from "@/lib/admin/permissions";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requirePermission(clerkUserId, "view_analytics");

    // Fetch all analytics data
    const [allUsers, totalTeams, activeTeams, totalCenters, verifiedCenters, totalReports] =
      await Promise.all([
        getAllUsers(1000, 0),
        db.select({ count: count() }).from(teams),
        db.select({ count: count() }).from(teams).where(eq(teams.isActive, true)),
        db.select({ count: count() }).from(bowlingCenters),
        db.select({ count: count() }).from(bowlingCenters).where(eq(bowlingCenters.verified, true)),
        db.select({ count: count() }).from(reports),
      ]);

    // Prepare CSV data
    const csvData = [
      { Metric: "Total Users", Value: allUsers.totalCount },
      { Metric: "Total Teams", Value: totalTeams[0]?.count ?? 0 },
      { Metric: "Active Teams", Value: activeTeams[0]?.count ?? 0 },
      { Metric: "Total Bowling Centers", Value: totalCenters[0]?.count ?? 0 },
      { Metric: "Verified Centers", Value: verifiedCenters[0]?.count ?? 0 },
      { Metric: "Total Reports", Value: totalReports[0]?.count ?? 0 },
      { Metric: "Export Date", Value: new Date().toISOString() },
    ];

    const csv = Papa.unparse(csvData);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="analytics-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting analytics:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to export analytics" },
      { status: 500 },
    );
  }
}
