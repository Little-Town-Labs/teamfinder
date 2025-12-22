import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { type NewReport, reports } from "@/drizzle/schema/reports";
import { users } from "@/drizzle/schema/users";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get database user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = (await request.json()) as {
      reportType: string;
      targetId: string;
      reason: string;
      description: string;
    };
    const { reportType, targetId, reason, description } = body;

    // Validate inputs
    if (!reportType || !targetId || !reason || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["user", "team", "message", "bowling_center"].includes(reportType)) {
      return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
    }

    if (
      ![
        "inappropriate_content",
        "harassment",
        "spam",
        "fake_profile",
        "incorrect_information",
        "other",
      ].includes(reason)
    ) {
      return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
    }

    if (description.length < 10) {
      return NextResponse.json(
        { error: "Description must be at least 10 characters" },
        { status: 400 },
      );
    }

    // Create report record
    const reportData = {
      reportedBy: user.id,
      reportType: reportType as "user" | "team" | "message" | "bowling_center",
      reason: reason as NewReport["reason"],
      description,
      status: "pending" as const,
      reportedUserId: reportType === "user" ? targetId : null,
      reportedTeamId: reportType === "team" ? targetId : null,
      reportedMessageId: reportType === "message" ? targetId : null,
      reportedCenterId: reportType === "bowling_center" ? targetId : null,
    };

    await db.insert(reports).values(reportData as NewReport);

    return NextResponse.json({
      success: true,
      message: "Report submitted successfully. Our team will review it shortly.",
    });
  } catch (error) {
    console.error("Error submitting report:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to submit report" },
      { status: 500 },
    );
  }
}
