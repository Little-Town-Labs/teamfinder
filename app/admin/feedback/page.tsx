import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { feedback } from "@/drizzle/schema/feedback";
import { PERMISSIONS } from "@/drizzle/schema/permissions";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/admin/permissions";

import FeedbackListClient from "./FeedbackListClient";

export default async function AdminFeedbackPage() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/sign-in?redirect_url=/admin/feedback");
  }

  try {
    await requirePermission(clerkUserId, PERMISSIONS.VIEW_FEEDBACK);
  } catch {
    redirect("/admin");
  }

  // Get stats for all statuses
  const allFeedback = await db.select().from(feedback);

  const stats = {
    submitted: allFeedback.filter((f) => f.status === "submitted").length,
    under_review: allFeedback.filter((f) => f.status === "under_review").length,
    planned: allFeedback.filter((f) => f.status === "planned").length,
    in_progress: allFeedback.filter((f) => f.status === "in_progress").length,
    completed: allFeedback.filter((f) => f.status === "completed").length,
    declined: allFeedback.filter((f) => f.status === "declined").length,
    total: allFeedback.length,
  };

  return <FeedbackListClient initialStats={stats} />;
}
