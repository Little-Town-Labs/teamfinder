"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export function AuditLogsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = searchParams.get("query") || "";
  const actionTypeFilter = searchParams.get("actionType") || "all";

  const handleActionTypeChange = (newActionType: string) => {
    const params = new URLSearchParams(searchParams);
    if (newActionType === "all") {
      params.delete("actionType");
    } else {
      params.set("actionType", newActionType);
    }
    params.delete("page"); // Reset to page 1 when filtering
    router.push(`/admin/audit-logs?${params.toString()}`);
  };

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
      <form method="GET" className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          name="query"
          defaultValue={query}
          placeholder="Search by target description..."
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </form>
      <select
        name="actionType"
        value={actionTypeFilter}
        onChange={(e) => handleActionTypeChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white py-2 px-4 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      >
        <option value="all">All Actions</option>
        <option value="user_locked">User Locked</option>
        <option value="user_unlocked">User Unlocked</option>
        <option value="user_banned">User Banned</option>
        <option value="user_unbanned">User Unbanned</option>
        <option value="team_edited">Team Edited</option>
        <option value="team_deleted">Team Deleted</option>
        <option value="team_flagged">Team Flagged</option>
        <option value="team_unflagged">Team Unflagged</option>
        <option value="report_reviewed">Report Reviewed</option>
        <option value="report_dismissed">Report Dismissed</option>
        <option value="center_created">Center Created</option>
        <option value="center_edited">Center Edited</option>
        <option value="center_deleted">Center Deleted</option>
      </select>
    </div>
  );
}
