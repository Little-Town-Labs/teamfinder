import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { feedback } from "@/drizzle/schema/feedback";
import { PERMISSIONS } from "@/drizzle/schema/permissions";
import { users } from "@/drizzle/schema/users";
import { requirePermission } from "@/lib/admin/permissions";
import { db } from "@/lib/db";

/**
 * GET /api/admin/feedback/[id] - Get single feedback with full details
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission
    await requirePermission(clerkUserId, PERMISSIONS.VIEW_FEEDBACK);

    const { id } = await params;

    // Fetch feedback with submitter and responder info
    const feedbackResult = await db
      .select({
        id: feedback.id,
        category: feedback.category,
        title: feedback.title,
        description: feedback.description,
        status: feedback.status,
        priority: feedback.priority,
        adminResponse: feedback.adminResponse,
        internalNotes: feedback.internalNotes,
        respondedAt: feedback.respondedAt,
        tags: feedback.tags,
        upvotes: feedback.upvotes,
        createdAt: feedback.createdAt,
        updatedAt: feedback.updatedAt,
        submitter: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          clerkUserId: users.clerkUserId,
        },
      })
      .from(feedback)
      .leftJoin(users, eq(feedback.submittedBy, users.id))
      .where(eq(feedback.id, id))
      .limit(1);

    if (feedbackResult.length === 0) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    const feedbackData = feedbackResult[0];

    // Get responder info if available
    let responder = null;
    if (feedbackData && "respondedBy" in feedbackData) {
      const feedbackWithRespondedBy = await db.query.feedback.findFirst({
        where: eq(feedback.id, id),
      });

      if (feedbackWithRespondedBy?.respondedBy) {
        const responderResult = await db.query.users.findFirst({
          where: eq(users.id, feedbackWithRespondedBy.respondedBy),
          columns: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        });
        responder = responderResult || null;
      }
    }

    return NextResponse.json({
      feedback: {
        ...feedbackData,
        responder,
      },
    });
  } catch (error) {
    console.error("Error fetching feedback details:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch feedback" },
      { status: 500 },
    );
  }
}
