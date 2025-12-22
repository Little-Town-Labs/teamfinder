import { auth } from "@clerk/nextjs/server";
import { and, count, desc, eq, ilike } from "drizzle-orm";
import { Download } from "lucide-react";
import Link from "next/link";

import { adminActions } from "@/drizzle/schema/admin-actions";
import { requirePermission } from "@/lib/admin/permissions";
import { db } from "@/lib/db";

import { AuditLogsFilters } from "./AuditLogsClient";

interface AuditLogsPageProps {
  searchParams: Promise<{ query?: string; actionType?: string; page?: string }>;
}

export default async function AuditLogsPage({ searchParams }: AuditLogsPageProps) {
  const { userId: clerkUserId } = await auth();
  await requirePermission(clerkUserId!, "view_audit_logs");

  const params = await searchParams;
  const query = params.query || "";
  const actionTypeFilter = params.actionType || "all";
  const page = parseInt(params.page || "1", 10);
  const limit = 50;
  const offset = (page - 1) * limit;

  // Build where conditions
  const conditions = [];
  if (query) {
    conditions.push(ilike(adminActions.targetDescription, `%${query}%`));
  }
  if (actionTypeFilter && actionTypeFilter !== "all") {
    conditions.push(eq(adminActions.actionType, actionTypeFilter as typeof adminActions.actionType.enumValues[number]));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Fetch logs with pagination
  const [logsData, totalCountResult] = await Promise.all([
    db
      .select()
      .from(adminActions)
      .where(whereClause)
      .orderBy(desc(adminActions.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(adminActions).where(whereClause),
  ]);

  const totalCount = totalCountResult[0]?.count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  const formatActionType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Complete history of all administrative actions
            </p>
          </div>
          <form action="/api/admin/audit-logs/export" method="POST">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </form>
        </div>
      </div>

      {/* Search and Filter */}
      <AuditLogsFilters />

      {/* Logs Table */}
      {logsData.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No logs found</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {query || actionTypeFilter !== "all"
              ? "Try adjusting your search or filters."
              : "No administrative actions have been recorded yet."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Target
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Reason
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              {logsData.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {log.createdAt.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {log.adminName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{log.adminRole}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {formatActionType(log.actionType)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {log.targetDescription}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {log.targetType}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {log.reason || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages} ({totalCount} total logs)
          </div>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/audit-logs?${new URLSearchParams({ ...(query && { query }), ...(actionTypeFilter !== "all" && { actionType: actionTypeFilter }), page: String(page - 1) }).toString()}`}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/audit-logs?${new URLSearchParams({ ...(query && { query }), ...(actionTypeFilter !== "all" && { actionType: actionTypeFilter }), page: String(page + 1) }).toString()}`}
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
