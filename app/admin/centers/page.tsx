import { auth } from "@clerk/nextjs/server";
import { count, desc, ilike } from "drizzle-orm";
import { MapPin, Plus, Search } from "lucide-react";
import Link from "next/link";

import { bowlingCenters } from "@/drizzle/schema/bowling-centers";
import { requirePermission } from "@/lib/admin/permissions";
import { db } from "@/lib/db";

interface CentersListPageProps {
  searchParams: Promise<{ query?: string; page?: string }>;
}

export default async function CentersListPage({ searchParams }: CentersListPageProps) {
  const { userId: clerkUserId } = await auth();
  await requirePermission(clerkUserId!, "view_centers");

  const params = await searchParams;
  const query = params.query || "";
  const page = parseInt(params.page || "1", 10);
  const limit = 50;
  const offset = (page - 1) * limit;

  // Build where conditions
  const conditions = [];
  if (query) {
    conditions.push(ilike(bowlingCenters.name, `%${query}%`));
  }

  const whereClause = conditions.length > 0 ? conditions[0] : undefined;

  // Fetch centers with pagination
  const [centersData, totalCountResult] = await Promise.all([
    db
      .select({
        id: bowlingCenters.id,
        name: bowlingCenters.name,
        address: bowlingCenters.address,
        city: bowlingCenters.city,
        state: bowlingCenters.state,
        zipCode: bowlingCenters.zipCode,
        phoneNumber: bowlingCenters.phone,
        website: bowlingCenters.website,
        laneCount: bowlingCenters.numberOfLanes,
        isVerified: bowlingCenters.verified,
        flaggedForReview: bowlingCenters.flaggedForReview,
        createdAt: bowlingCenters.createdAt,
      })
      .from(bowlingCenters)
      .where(whereClause)
      .orderBy(desc(bowlingCenters.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(bowlingCenters).where(whereClause),
  ]);

  const totalCount = totalCountResult[0]?.count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bowling Centers</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage bowling center directory
            </p>
          </div>
          <Link
            href="/admin/centers/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            <Plus className="h-4 w-4" />
            Add Center
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <form method="GET" className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="query"
            defaultValue={query}
            placeholder="Search by center name..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </form>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Centers</div>
          <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{totalCount}</div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Verified Centers
          </div>
          <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {centersData.filter((c) => c.isVerified).length}
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Flagged Centers
          </div>
          <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {centersData.filter((c) => c.flaggedForReview).length}
          </div>
        </div>
      </div>

      {/* Centers List */}
      {centersData.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow dark:bg-gray-800">
          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No centers found
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {query ? "Try a different search term." : "Get started by adding your first center."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Center Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Lanes
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
              {centersData.map((center) => (
                <tr key={center.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {center.name}
                        </div>
                        {center.phoneNumber && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {center.phoneNumber}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {center.city}, {center.state}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {center.zipCode}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {center.laneCount || "N/A"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {center.isVerified ? (
                        <span className="inline-flex w-fit items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex w-fit items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          Unverified
                        </span>
                      )}
                      {center.flaggedForReview && (
                        <span className="inline-flex w-fit items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                          Flagged
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <Link
                      href={`/admin/centers/${center.id}/edit`}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      Edit
                    </Link>
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
            Page {page} of {totalPages} ({totalCount} total centers)
          </div>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/centers?${new URLSearchParams({ ...(query && { query }), page: String(page - 1) }).toString()}`}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/centers?${new URLSearchParams({ ...(query && { query }), page: String(page + 1) }).toString()}`}
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
