import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { bowlingCenters } from "@/drizzle/schema/bowling-centers";
import { messages } from "@/drizzle/schema/messages";
import { reports } from "@/drizzle/schema/reports";
import { teams } from "@/drizzle/schema/teams";
import { users } from "@/drizzle/schema/users";
import { requirePermission } from "@/lib/admin/permissions";
import { db } from "@/lib/db";
import { ReportDetailClient } from "./ReportDetailClient";

interface ReportDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReportDetailPage({ params }: ReportDetailPageProps) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    redirect("/sign-in?redirect_url=/admin/reports");
  }

  await requirePermission(clerkUserId, "view_reports");

  const { id: reportId } = await params;

  // Fetch report with all related data
  const [reportData] = await db
    .select({
      // Report fields
      id: reports.id,
      reportType: reports.reportType,
      reason: reports.reason,
      description: reports.description,
      status: reports.status,
      createdAt: reports.createdAt,
      reviewedAt: reports.reviewedAt,
      reviewNotes: reports.reviewNotes,
      actionTaken: reports.actionTaken,
      reportedUserId: reports.reportedUserId,
      reportedTeamId: reports.reportedTeamId,
      reportedMessageId: reports.reportedMessageId,
      reportedCenterId: reports.reportedCenterId,
      // Reporter info
      reporterFirstName: users.firstName,
      reporterLastName: users.lastName,
      reporterEmail: users.email,
      reporterClerkUserId: users.clerkUserId,
      reporterId: users.id,
    })
    .from(reports)
    .leftJoin(users, eq(reports.reportedBy, users.id))
    .where(eq(reports.id, reportId))
    .limit(1);

  if (!reportData) {
    redirect("/admin/reports");
  }

  // Fetch reported content based on type
  let reportedContent: {
    type: string;
    id: string;
    description: string;
    link?: string;
  } | null = null;

  if (reportData.reportType === "user" && reportData.reportedUserId) {
    const [reportedUser] = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        clerkUserId: users.clerkUserId,
      })
      .from(users)
      .where(eq(users.id, reportData.reportedUserId))
      .limit(1);

    if (reportedUser) {
      const name =
        [reportedUser.firstName, reportedUser.lastName].filter(Boolean).join(" ") ||
        reportedUser.email ||
        "Unknown";
      reportedContent = {
        type: "User",
        id: reportedUser.id,
        description: name,
        link: `/admin/users/${reportedUser.clerkUserId}`,
      };
    }
  } else if (reportData.reportType === "team" && reportData.reportedTeamId) {
    const [reportedTeam] = await db
      .select({
        id: teams.id,
        name: teams.name,
        description: teams.description,
      })
      .from(teams)
      .where(eq(teams.id, reportData.reportedTeamId))
      .limit(1);

    if (reportedTeam) {
      reportedContent = {
        type: "Team",
        id: reportedTeam.id,
        description: reportedTeam.name,
        link: `/admin/teams/${reportedTeam.id}`,
      };
    }
  } else if (reportData.reportType === "message" && reportData.reportedMessageId) {
    const [reportedMessage] = await db
      .select({
        id: messages.id,
        content: messages.content,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(eq(messages.id, reportData.reportedMessageId))
      .limit(1);

    if (reportedMessage) {
      reportedContent = {
        type: "Message",
        id: reportedMessage.id,
        description: reportedMessage.content.substring(0, 100) + "...",
      };
    }
  } else if (reportData.reportType === "bowling_center" && reportData.reportedCenterId) {
    const [reportedCenter] = await db
      .select({
        id: bowlingCenters.id,
        name: bowlingCenters.name,
        city: bowlingCenters.city,
        state: bowlingCenters.state,
      })
      .from(bowlingCenters)
      .where(eq(bowlingCenters.id, reportData.reportedCenterId))
      .limit(1);

    if (reportedCenter) {
      reportedContent = {
        type: "Bowling Center",
        id: reportedCenter.id,
        description: `${reportedCenter.name} - ${reportedCenter.city}, ${reportedCenter.state}`,
        link: `/admin/centers/${reportedCenter.id}`,
      };
    }
  }

  return (
    <ReportDetailClient reportData={reportData} reportedContent={reportedContent} adminClerkUserId={clerkUserId} />
  );
}
