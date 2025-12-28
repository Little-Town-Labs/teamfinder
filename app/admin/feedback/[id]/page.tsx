import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { PERMISSIONS } from "@/drizzle/schema/permissions";
import { hasPermission, requirePermission } from "@/lib/admin/permissions";

import FeedbackDetailClient from "./FeedbackDetailClient";

export default async function AdminFeedbackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/sign-in?redirect_url=/admin/feedback");
  }

  try {
    await requirePermission(clerkUserId, PERMISSIONS.VIEW_FEEDBACK);
  } catch {
    redirect("/admin");
  }

  const { id } = await params;

  // Check if user can respond to feedback
  const canRespond = await hasPermission(clerkUserId, PERMISSIONS.RESPOND_TO_FEEDBACK);

  // Check if user can manage feedback (set priority, internal notes, tags)
  const canManage = await hasPermission(clerkUserId, PERMISSIONS.MANAGE_FEEDBACK);

  return <FeedbackDetailClient feedbackId={id} canRespond={canRespond} canManage={canManage} />;
}
