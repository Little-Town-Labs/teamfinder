import { auth } from "@clerk/nextjs/server";
import { count, desc, eq } from "drizzle-orm";
import { Clock, TrendingUp } from "lucide-react";

import { adminActions } from "@/drizzle/schema/admin-actions";
import { bowlingCenters } from "@/drizzle/schema/bowling-centers";
import { reports } from "@/drizzle/schema/reports";
import { teams } from "@/drizzle/schema/teams";
import { getAllUsers } from "@/lib/admin/clerk-integration";
import { getAdminRole } from "@/lib/admin/permissions";
import { db } from "@/lib/db";

export default async function AdminDashboard() {
  const { userId } = await auth();
  const _role = await getAdminRole(userId!);

  // Fetch stats in parallel
  const [clerkUsers, teamsResult, pendingReportsResult, centersResult, recentActions] =
    await Promise.all([
      getAllUsers(1, 0), // Just get the count
      db.select({ count: count() }).from(teams).where(eq(teams.isActive, true)),
      db.select({ count: count() }).from(reports).where(eq(reports.status, "pending")),
      db.select({ count: count() }).from(bowlingCenters),
      db
        .select({
          id: adminActions.id,
          adminName: adminActions.adminName,
          actionType: adminActions.actionType,
          targetDescription: adminActions.targetDescription,
          createdAt: adminActions.createdAt,
        })
        .from(adminActions)
        .orderBy(desc(adminActions.createdAt))
        .limit(10),
    ]);

  const stats = {
    totalUsers: clerkUsers.totalCount,
    activeTeams: teamsResult[0]?.count ?? 0,
    pendingReports: pendingReportsResult[0]?.count ?? 0,
    bowlingCenters: centersResult[0]?.count ?? 0,
  };

  // Format action type for display
  const formatActionType = (actionType: string) => {
    return actionType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Format relative time
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Welcome to the TeamFinder admin panel
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {stats.totalUsers.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center text-sm text-green-600 dark:text-green-400">
            <TrendingUp className="mr-1 h-4 w-4" />
            From Clerk
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Teams</div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {stats.activeTeams.toLocaleString()}
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-500">Currently active</div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Pending Reports
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {stats.pendingReports.toLocaleString()}
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-500">
            {stats.pendingReports > 0 ? "Needs review" : "All clear"}
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Bowling Centers
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {stats.bowlingCenters.toLocaleString()}
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-500">In directory</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
        <div className="mt-4 rounded-lg bg-white shadow dark:bg-gray-800">
          {recentActions.length === 0 ? (
            <div className="p-6 text-center text-gray-600 dark:text-gray-400">
              No admin actions yet
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentActions.map((action) => (
                <div key={action.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {action.adminName}
                      </p>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {formatActionType(action.actionType)}
                        {action.targetDescription && (
                          <span className="text-gray-500"> · {action.targetDescription}</span>
                        )}
                      </p>
                    </div>
                    <div className="ml-4 flex items-center text-sm text-gray-500 dark:text-gray-500">
                      <Clock className="mr-1 h-4 w-4" />
                      {formatRelativeTime(action.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
