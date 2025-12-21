import { auth, clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { bowlingCenters, centerEditSuggestions, users } from "@/drizzle/schema";
import { logCenterEditApproved, logCenterEditRejected } from "@/lib/activity-logger";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Validation schema for review action
const reviewSchema = z.object({
  action: z.enum(["approve", "reject"]),
  reviewNotes: z.string().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: suggestionId } = await params;

    // Check authentication
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

    // Get user metadata from Clerk to check admin role
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkUserId);
    const isAdmin = clerkUser.publicMetadata?.role === "admin";

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const { action, reviewNotes } = reviewSchema.parse(body);

    // Get the suggestion with related data
    const suggestion = await db.query.centerEditSuggestions.findFirst({
      where: eq(centerEditSuggestions.id, suggestionId),
      with: {
        bowlingCenter: true,
        suggestor: true,
      },
    });

    if (!suggestion) {
      return NextResponse.json({ error: "Suggestion not found" }, { status: 404 });
    }

    if (suggestion.status !== "pending") {
      return NextResponse.json({ error: "Suggestion has already been reviewed" }, { status: 400 });
    }

    // Update suggestion status
    const [updatedSuggestion] = await db
      .update(centerEditSuggestions)
      .set({
        status: action === "approve" ? "approved" : "rejected",
        reviewedBy: user.id,
        reviewNotes: reviewNotes || null,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(centerEditSuggestions.id, suggestionId))
      .returning();

    // If approved, apply changes to the bowling center
    if (action === "approve") {
      const changes = suggestion.suggestedChanges as Record<string, string | string[]>;

      await db
        .update(bowlingCenters)
        .set({
          ...changes,
          updatedAt: new Date(),
        })
        .where(eq(bowlingCenters.id, suggestion.bowlingCenterId));

      // Log activity for the suggestor
      await logCenterEditApproved({
        userId: suggestion.suggestedBy,
        centerId: suggestion.bowlingCenterId,
        centerName: suggestion.bowlingCenter.name,
        reviewerName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
      });
    } else {
      // Log rejection
      await logCenterEditRejected({
        userId: suggestion.suggestedBy,
        centerId: suggestion.bowlingCenterId,
        centerName: suggestion.bowlingCenter.name,
        reviewerName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
        reason: reviewNotes,
      });
    }

    return NextResponse.json(updatedSuggestion);
  } catch (error) {
    console.error("Error reviewing suggestion:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to review suggestion" }, { status: 500 });
  }
}
