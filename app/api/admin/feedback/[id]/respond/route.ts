import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { feedback, type FeedbackPriority, type FeedbackStatus } from "@/drizzle/schema/feedback";
import { PERMISSIONS } from "@/drizzle/schema/permissions";
import { users } from "@/drizzle/schema/users";
import { logAdminAction } from "@/lib/admin/audit-logger";
import { emailTemplates, resend } from "@/lib/email";
import { hasPermission, requirePermission } from "@/lib/admin/permissions";
import { db } from "@/lib/db";

// Validation schema
const respondSchema = z.object({
  status: z.enum(["submitted", "under_review", "planned", "in_progress", "completed", "declined"]),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  adminResponse: z.string().min(1).max(2000).optional(),
  internalNotes: z.string().max(5000).optional(),
  tags: z.array(z.string()).optional(),
});

/**
 * POST /api/admin/feedback/[id]/respond - Admin response to feedback
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission
    await requirePermission(clerkUserId, PERMISSIONS.RESPOND_TO_FEEDBACK);

    // Get admin user from database
    const adminUser = await db.query.users.findFirst({
      where: eq(users.clerkUserId, clerkUserId),
    });

    if (!adminUser) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
    }

    const { id } = await params;

    // Get existing feedback
    const existingFeedback = await db.query.feedback.findFirst({
      where: eq(feedback.id, id),
      with: {
        submitter: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!existingFeedback) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    const body = (await request.json()) as {
      status: string;
      priority?: string;
      adminResponse?: string;
      internalNotes?: string;
      tags?: string[];
    };

    // Validate input
    const validation = respondSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.errors },
        { status: 400 },
      );
    }

    const { status: newStatus, priority, adminResponse, internalNotes, tags } = validation.data;

    // Check if user has permission to set priority/internal notes (MANAGE_FEEDBACK)
    const canManage = await hasPermission(clerkUserId, PERMISSIONS.MANAGE_FEEDBACK);

    // Build update data
    const updateData: Partial<typeof feedback.$inferInsert> = {
      status: newStatus as FeedbackStatus,
      updatedAt: new Date(),
    };

    if (adminResponse !== undefined) {
      updateData.adminResponse = adminResponse;
      updateData.respondedBy = adminUser.id;
      updateData.respondedAt = new Date();
    }

    if (canManage) {
      if (priority !== undefined) {
        updateData.priority = priority as FeedbackPriority;
      }
      if (internalNotes !== undefined) {
        updateData.internalNotes = internalNotes;
      }
      if (tags !== undefined) {
        updateData.tags = tags;
      }
    }

    // Update feedback
    const [updatedFeedback] = await db
      .update(feedback)
      .set(updateData)
      .where(eq(feedback.id, id))
      .returning();

    // Send email notification if admin response provided
    if (adminResponse && existingFeedback.submitter) {
      try {
        const emailData = await emailTemplates.feedbackResponse(
          existingFeedback.submitter.email,
          existingFeedback.submitter.firstName || "User",
          existingFeedback.title,
          newStatus as FeedbackStatus,
          adminResponse,
        );

        await resend.emails.send(emailData);
      } catch (emailError) {
        console.error("Failed to send feedback response email:", emailError);
        // Don't fail the request if email fails
      }
    }

    // Log admin action
    await logAdminAction({
      adminClerkUserId: clerkUserId,
      adminName: `${adminUser.firstName || ""} ${adminUser.lastName || ""}`.trim() || adminUser.email,
      actionType: "feedback_responded",
      targetType: "feedback",
      targetId: id,
      targetDescription: existingFeedback.title,
      previousValue: {
        status: existingFeedback.status,
        priority: existingFeedback.priority,
        adminResponse: existingFeedback.adminResponse,
      },
      newValue: {
        status: newStatus,
        ...(priority && { priority }),
        ...(adminResponse && { adminResponse }),
      },
      metadata: {
        feedbackCategory: existingFeedback.category,
        submitterId: existingFeedback.submitter?.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Feedback updated successfully",
      feedback: updatedFeedback,
    });
  } catch (error) {
    console.error("Error responding to feedback:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to respond to feedback" },
      { status: 500 },
    );
  }
}
