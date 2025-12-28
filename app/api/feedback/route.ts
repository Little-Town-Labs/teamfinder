import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { feedback, type FeedbackCategory, type NewFeedback } from "@/drizzle/schema/feedback";
import { users } from "@/drizzle/schema/users";
import { db } from "@/lib/db";

// Validation schema
const feedbackSchema = z.object({
  category: z.enum(["bug_report", "feature_request", "general_feedback", "other"]),
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(5000, "Description must be less than 5000 characters"),
});

/**
 * POST /api/feedback - Submit new feedback
 */
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get database user
    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkUserId, clerkUserId),
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = (await request.json()) as {
      category: string;
      title: string;
      description: string;
    };

    // Validate input
    const validation = feedbackSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.errors },
        { status: 400 },
      );
    }

    const { category, title, description } = validation.data;

    // Create feedback record
    const feedbackData: NewFeedback = {
      submittedBy: dbUser.id,
      category: category as FeedbackCategory,
      title,
      description,
      status: "submitted",
    };

    const [newFeedback] = await db.insert(feedback).values(feedbackData).returning();

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for your feedback! We'll review it shortly.",
        feedback: newFeedback,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to submit feedback" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/feedback - List current user's feedback submissions
 * Query params: ?category=bug_report&status=submitted
 */
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get database user
    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkUserId, clerkUserId),
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const categoryFilter = searchParams.get("category");
    const statusFilter = searchParams.get("status");

    // Fetch user's feedback
    const query = db
      .select({
        id: feedback.id,
        category: feedback.category,
        title: feedback.title,
        description: feedback.description,
        status: feedback.status,
        priority: feedback.priority,
        adminResponse: feedback.adminResponse,
        respondedAt: feedback.respondedAt,
        createdAt: feedback.createdAt,
        updatedAt: feedback.updatedAt,
      })
      .from(feedback)
      .where(eq(feedback.submittedBy, dbUser.id))
      .orderBy(desc(feedback.createdAt));

    const feedbackList = await query;

    // Client-side filtering (could be moved to SQL for performance)
    let filtered = feedbackList;
    if (categoryFilter) {
      filtered = filtered.filter((f) => f.category === categoryFilter);
    }
    if (statusFilter) {
      filtered = filtered.filter((f) => f.status === statusFilter);
    }

    return NextResponse.json({ feedback: filtered });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch feedback" },
      { status: 500 },
    );
  }
}
