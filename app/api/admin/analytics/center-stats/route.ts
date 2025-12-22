import { auth } from "@clerk/nextjs/server";
import { count, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { bowlingCenters } from "@/drizzle/schema/bowling-centers";
import { requirePermission } from "@/lib/admin/permissions";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requirePermission(clerkUserId, "view_analytics");

    const [totalCentersResult, verifiedCentersResult, flaggedCentersResult] = await Promise.all([
      db.select({ count: count() }).from(bowlingCenters),
      db.select({ count: count() }).from(bowlingCenters).where(eq(bowlingCenters.verified, true)),
      db
        .select({ count: count() })
        .from(bowlingCenters)
        .where(eq(bowlingCenters.flaggedForReview, true)),
    ]);

    const data = {
      totalCenters: totalCentersResult[0]?.count ?? 0,
      verifiedCenters: verifiedCentersResult[0]?.count ?? 0,
      flaggedCenters: flaggedCentersResult[0]?.count ?? 0,
    };

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching center stats:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch center stats" },
      { status: 500 },
    );
  }
}
