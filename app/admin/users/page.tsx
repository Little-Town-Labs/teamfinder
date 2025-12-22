import { auth } from "@clerk/nextjs/server";
import { inArray } from "drizzle-orm";
import { Ban, Lock, Search, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { users } from "@/drizzle/schema/users";
import { getAllUsers, searchUsers } from "@/lib/admin/clerk-integration";
import { requirePermission } from "@/lib/admin/permissions";
import { db } from "@/lib/db";

interface UserListPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function UserListPage({ searchParams }: UserListPageProps) {
  const { userId: clerkUserId } = await auth();
  await requirePermission(clerkUserId!, "view_users");

  const params = await searchParams;
  const query = params.q || "";
  const page = parseInt(params.page || "1", 10);
  const limit = 50;
  const offset = (page - 1) * limit;

  // Fetch users from Clerk (with search if provided)
  const clerkResult = query
    ? await searchUsers(query, limit, offset)
    : await getAllUsers(limit, offset);

  // Fetch database user data for all Clerk users
  const dbUsersMap = new Map();
  if (clerkResult.data.length > 0) {
    const clerkUserIds = clerkResult.data.map((u) => u.id);
    const dbUsers = await db
      .select()
      .from(users)
      .where(inArray(users.clerkUserId, clerkUserIds));

    // Map by clerkUserId for quick lookup
    dbUsers.forEach((user) => {
      dbUsersMap.set(user.clerkUserId, user);
    });
  }

  const totalPages = Math.ceil(clerkResult.totalCount / limit);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage users, ban/lock accounts, and verify USBC memberships
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <form action="/admin/users" method="get" className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search by name, email, or phone..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
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
          Showing <span className="font-medium text-gray-900 dark:text-white">{clerkResult.data.length}</span> of{" "}
          <span className="font-medium text-gray-900 dark:text-white">{clerkResult.totalCount.toLocaleString()}</span>{" "}
          total users
        </p>
      </div>

      {/* User List */}
      <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Joined
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            {clerkResult.data.map((clerkUser) => {
              const dbUser = dbUsersMap.get(clerkUser.id);
              const email = clerkUser.emailAddresses[0]?.emailAddress || "No email";
              const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || "No name";
              const joinedDate = new Date(clerkUser.createdAt);

              return (
                <tr key={clerkUser.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <Image
                        src={clerkUser.imageUrl}
                        alt={name}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">ID: {clerkUser.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">{email}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {clerkUser.banned && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                          <Ban className="h-3 w-3" />
                          Banned
                        </span>
                      )}
                      {clerkUser.locked && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                          <Lock className="h-3 w-3" />
                          Locked
                        </span>
                      )}
                      {dbUser?.lastVerifiedAt && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                          <ShieldCheck className="h-3 w-3" />
                          USBC Verified
                        </span>
                      )}
                      {!clerkUser.banned && !clerkUser.locked && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                          Active
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {joinedDate.toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <Link
                      href={`/admin/users/${clerkUser.id}`}
                      className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      View Details →
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
                href={`/admin/users?${query ? `q=${query}&` : ""}page=${page - 1}`}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/users?${query ? `q=${query}&` : ""}page=${page + 1}`}
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
