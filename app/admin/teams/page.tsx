import { auth } from "@clerk/nextjs/server";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { Flag, Search, Shield } from "lucide-react";
import Link from "next/link";

import { teams } from "@/drizzle/schema/teams";
import { users } from "@/drizzle/schema/users";
import { requirePermission } from "@/lib/admin/permissions";
import { db } from "@/lib/db";

interface TeamListPageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export default async function TeamListPage({ searchParams }: TeamListPageProps) {
  const { userId: clerkUserId } = await auth();
  await requirePermission(clerkUserId!, "view_teams");

  const params = await searchParams;
  const query = params.q || "";
  const statusFilter = params.status || "all";
  const page = parseInt(params.page || "1", 10);
  const limit = 50;
  const offset = (page - 1) * limit;

  // Build where conditions
  const conditions = [];

  if (query) {
    conditions.push(ilike(teams.name, `%${query}%`));
  }

  if (statusFilter === "active") {
    conditions.push(eq(teams.isActive, true));
  } else if (statusFilter === "inactive") {
    conditions.push(eq(teams.isActive, false));
  } else if (statusFilter === "flagged") {
    conditions.push(eq(teams.flaggedForReview, true));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Fetch teams with captain info
  const [teamsData, totalCountResult] = await Promise.all([
    db
      .select({
        id: teams.id,
        name: teams.name,
        teamType: teams.teamType,
        competitionLevel: teams.competitionLevel,
        isActive: teams.isActive,
        flaggedForReview: teams.flaggedForReview,
        flaggedReason: teams.flaggedReason,
        currentRosterSize: teams.currentRosterSize,
        maxRosterSize: teams.maxRosterSize,
        lookingForPlayers: teams.lookingForPlayers,
        createdAt: teams.createdAt,
        captainFirstName: users.firstName,
        captainLastName: users.lastName,
        captainEmail: users.email,
      })
      .from(teams)
      .leftJoin(users, eq(teams.captainId, users.id))
      .where(whereClause)
      .orderBy(desc(teams.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(teams)
      .where(whereClause),
  ]);

  const totalCount = totalCountResult[0]?.count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Team Moderation</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage teams, review flagged content, and moderate team activities
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <form action="/admin/teams" method="get" className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search teams by name..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <select
            name="status"
            defaultValue={statusFilter}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="all">All Teams</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
            <option value="flagged">Flagged for Review</option>
          </select>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            Search
          </button>
        </form>
      </div>

      {/* Stats */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing <span className="font-medium text-gray-900 dark:text-white">{teamsData.length}</span> of{" "}
          <span className="font-medium text-gray-900 dark:text-white">{totalCount.toLocaleString()}</span> teams
        </p>
      </div>

      {/* Team List */}
      <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Team
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Captain
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Roster
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            {teamsData.map((team) => {
              const captainName =
                [team.captainFirstName, team.captainLastName].filter(Boolean).join(" ") || team.captainEmail || "Unknown";

              return (
                <tr key={team.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <Shield className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{team.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {team.competitionLevel.charAt(0).toUpperCase() + team.competitionLevel.slice(1)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">{captainName}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {team.teamType}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {team.currentRosterSize} / {team.maxRosterSize}
                    {team.lookingForPlayers && (
                      <span className="ml-2 text-green-600 dark:text-green-400">(Recruiting)</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {team.flaggedForReview && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                          <Flag className="h-3 w-3" />
                          Flagged
                        </span>
                      )}
                      {team.isActive ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          Inactive
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <Link
                      href={`/admin/teams/${team.id}`}
                      className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Manage →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/teams?${query ? `q=${query}&` : ""}${statusFilter !== "all" ? `status=${statusFilter}&` : ""}page=${page - 1}`}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/teams?${query ? `q=${query}&` : ""}${statusFilter !== "all" ? `status=${statusFilter}&` : ""}page=${page + 1}`}
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
