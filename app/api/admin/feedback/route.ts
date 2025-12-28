import { auth } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { feedback } from "@/drizzle/schema/feedback";
import { PERMISSIONS } from "@/drizzle/schema/permissions";
import { users } from "@/drizzle/schema/users";
import { requirePermission } from "@/lib/admin/permissions";
import { db } from "@/lib/db";

/**
 * GET /api/admin/feedback - List all feedback with filters
 * Query params: ?status=submitted&category=bug_report&priority=high&page=1
 */
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission
    await requirePermission(clerkUserId, PERMISSIONS.VIEW_FEEDBACK);

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");
    const categoryFilter = searchParams.get("category");
    const priorityFilter = searchParams.get("priority");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = 50;
    const offset = (page - 1) * pageSize;

    // Build where conditions
    const conditions = [];
    if (statusFilter) {
      conditions.push(eq(feedback.status, statusFilter as typeof feedback.status.enumValues[number]));
    }
    if (categoryFilter) {
      conditions.push(eq(feedback.category, categoryFilter as typeof feedback.category.enumValues[number]));
    }
    if (priorityFilter) {
      conditions.push(eq(feedback.priority, priorityFilter as typeof feedback.priority.enumValues[number]));
    }

    // Fetch feedback with submitter info
    const feedbackList = await db
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
        },
      })
      .from(feedback)
      .leftJoin(users, eq(feedback.submittedBy, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(feedback.createdAt))
      .limit(pageSize)
      .offset(offset);

    // Get total count for pagination
    const totalResult = await db
      .select({ count: feedback.id })
      .from(feedback)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = totalResult.length;
    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      feedback: feedbackList,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching admin feedback:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch feedback" },
      { status: 500 },
    );
  }
}
