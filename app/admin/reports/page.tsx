import { auth } from "@clerk/nextjs/server";
import { and, count, desc, eq } from "drizzle-orm";
import { AlertTriangle, CheckCircle, Flag, XCircle } from "lucide-react";
import Link from "next/link";

import { reports } from "@/drizzle/schema/reports";
import { users } from "@/drizzle/schema/users";
import { requirePermission } from "@/lib/admin/permissions";
import { db } from "@/lib/db";

interface ReportsListPageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function ReportsListPage({ searchParams }: ReportsListPageProps) {
  const { userId: clerkUserId } = await auth();
  await requirePermission(clerkUserId!, "view_reports");

  const params = await searchParams;
  const statusFilter = params.status || "pending";
  const page = parseInt(params.page || "1", 10);
  const limit = 50;
  const offset = (page - 1) * limit;

  // Build where conditions
  const conditions = [];
  if (statusFilter && statusFilter !== "all") {
    conditions.push(eq(reports.status, statusFilter as "pending" | "investigating" | "resolved" | "dismissed"));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Fetch reports with reporter info
  const [reportsData, totalCountResult, statusCounts] = await Promise.all([
    db
      .select({
        id: reports.id,
        reportType: reports.reportType,
        reason: reports.reason,
        description: reports.description,
        status: reports.status,
        createdAt: reports.createdAt,
        reviewedAt: reports.reviewedAt,
        reporterFirstName: users.firstName,
        reporterLastName: users.lastName,
        reporterEmail: users.email,
      })
      .from(reports)
      .leftJoin(users, eq(reports.reportedBy, users.id))
      .where(whereClause)
      .orderBy(desc(reports.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(reports)
      .where(whereClause),
    // Get counts for each status
    Promise.all([
      db.select({ count: count() }).from(reports).where(eq(reports.status, "pending")),
      db.select({ count: count() }).from(reports).where(eq(reports.status, "investigating")),
      db.select({ count: count() }).from(reports).where(eq(reports.status, "resolved")),
      db.select({ count: count() }).from(reports).where(eq(reports.status, "dismissed")),
    ]),
  ]);

  const totalCount = totalCountResult[0]?.count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  const counts = {
    pending: statusCounts[0][0]?.count ?? 0,
    investigating: statusCounts[1][0]?.count ?? 0,
    resolved: statusCounts[2][0]?.count ?? 0,
    dismissed: statusCounts[3][0]?.count ?? 0,
  };

  const formatReportType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatReason = (reason: string) => {
    return reason
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Moderation</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Review and manage user-submitted reports
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { value: "pending", label: "Pending", count: counts.pending, icon: Flag },
              { value: "investigating", label: "Investigating", count: counts.investigating, icon: AlertTriangle },
              { value: "resolved", label: "Resolved", count: counts.resolved, icon: CheckCircle },
              { value: "dismissed", label: "Dismissed", count: counts.dismissed, icon: XCircle },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = statusFilter === tab.value;
              return (
                <Link
                  key={tab.value}
                  href={`/admin/reports?status=${tab.value}`}
                  className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium ${
                    isActive
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                  <span
                    className={`ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      isActive
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Reports List */}
      {reportsData.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow dark:bg-gray-800">
          <Flag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No reports found</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {statusFilter === "pending"
              ? "All clear! No pending reports to review."
              : `No ${statusFilter} reports.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reportsData.map((report) => {
            const reporterName =
              [report.reporterFirstName, report.reporterLastName].filter(Boolean).join(" ") ||
              report.reporterEmail ||
              "Unknown";

            const statusColors = {
              pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
              investigating: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
              resolved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
              dismissed: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
            };

            return (
              <div
                key={report.id}
                className="rounded-lg bg-white p-6 shadow hover:shadow-md dark:bg-gray-800"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                          statusColors[report.status]
                        }`}
                      >
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatReportType(report.reportType)}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">·</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatReason(report.reason)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                      {report.description}
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>Reported by {reporterName}</span>
                      <span>·</span>
                      <span>{formatRelativeTime(report.createdAt)}</span>
                      {report.reviewedAt && (
                        <>
                          <span>·</span>
                          <span>Reviewed {formatRelativeTime(report.reviewedAt)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/admin/reports/${report.id}`}
                    className="ml-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                  >
                    Review
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/reports?status=${statusFilter}&page=${page - 1}`}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/reports?status=${statusFilter}&page=${page + 1}`}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
