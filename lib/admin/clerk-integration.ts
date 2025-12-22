/**
 * Clerk Integration Utilities
 * Wrappers for Clerk APIs used in admin panel
 */

import { clerkClient } from "@clerk/nextjs/server";

import type { AdminRoleType } from "@/drizzle/schema/admin-roles";

/**
 * User Moderation Functions
 * These use Clerk's built-in ban/lock APIs
 */

/**
 * Ban a user permanently
 * Banned users cannot sign in and all sessions are invalidated
 */
export async function banUser(clerkUserId: string): Promise<void> {
  const client = await clerkClient();
  await client.users.banUser(clerkUserId);
}

/**
 * Unban a previously banned user
 */
export async function unbanUser(clerkUserId: string): Promise<void> {
  const client = await clerkClient();
  await client.users.unbanUser(clerkUserId);
}

/**
 * Lock a user (temporary suspension)
 * Locked users cannot sign in until unlocked
 * Note: Clerk doesn't support automatic unlock at a specific time via API
 */
export async function lockUser(clerkUserId: string): Promise<void> {
  const client = await clerkClient();
  await client.users.lockUser(clerkUserId);
}

/**
 * Unlock a previously locked user
 */
export async function unlockUser(clerkUserId: string): Promise<void> {
  const client = await clerkClient();
  await client.users.unlockUser(clerkUserId);
}

/**
 * Check if user is currently banned
 */
export async function isUserBanned(clerkUserId: string): Promise<boolean> {
  const client = await clerkClient();
  const user = await client.users.getUser(clerkUserId);
  return user.banned;
}

/**
 * Check if user is currently locked
 */
export async function isUserLocked(clerkUserId: string): Promise<boolean> {
  const client = await clerkClient();
  const user = await client.users.getUser(clerkUserId);
  return user.locked;
}

/**
 * Admin Role Management Functions
 * These use Clerk's publicMetadata for app-wide admin roles
 */

/**
 * Assign an admin role to a user via Clerk publicMetadata
 */
export async function assignAdminRole(clerkUserId: string, role: AdminRoleType): Promise<void> {
  const client = await clerkClient();
  await client.users.updateUser(clerkUserId, {
    publicMetadata: { role },
  });
}

/**
 * Revoke admin role from a user
 */
export async function revokeAdminRole(clerkUserId: string): Promise<void> {
  const client = await clerkClient();
  await client.users.updateUser(clerkUserId, {
    publicMetadata: { role: null },
  });
}

/**
 * Get user's admin role from Clerk publicMetadata
 */
export async function getUserAdminRole(clerkUserId: string): Promise<AdminRoleType | null> {
  const client = await clerkClient();
  const user = await client.users.getUser(clerkUserId);
  const role = user.publicMetadata?.role as AdminRoleType | undefined;
  return role || null;
}

/**
 * Check if user has any admin role
 */
export async function isAdmin(clerkUserId: string): Promise<boolean> {
  const client = await clerkClient();
  const user = await client.users.getUser(clerkUserId);
  const role = user.publicMetadata?.role as string | undefined;
  return ["super_admin", "moderator", "content_reviewer", "support"].includes(role || "");
}

/**
 * User Search and Retrieval Functions
 */

/**
 * Search users by query (searches email, phone, name)
 */
export async function searchUsers(query: string, limit = 50, offset = 0) {
  const client = await clerkClient();
  const result = await client.users.getUserList({
    query,
    limit,
    offset,
  });

  return {
    data: result.data,
    totalCount: result.totalCount,
  };
}

/**
 * Get a specific user by Clerk ID
 */
export async function getClerkUser(clerkUserId: string) {
  const client = await clerkClient();
  return await client.users.getUser(clerkUserId);
}

/**
 * Get all users with pagination
 */
export async function getAllUsers(limit = 50, offset = 0) {
  const client = await clerkClient();
  return await client.users.getUserList({
    limit,
    offset,
    orderBy: "-created_at", // Most recent first
  });
}

/**
 * Get users filtered by ban/lock status
 */
export async function getUsersByStatus(
  status: "banned" | "locked" | "active",
  limit = 50,
  offset = 0,
) {
  const client = await clerkClient();

  // Clerk doesn't support filtering by banned/locked directly,
  // so we fetch all users and filter in memory
  const result = await client.users.getUserList({
    limit: limit * 2, // Fetch more to account for filtering
    offset,
    orderBy: "-created_at",
  });

  const filtered = result.data.filter((user) => {
    if (status === "banned") return user.banned;
    if (status === "locked") return user.locked;
    if (status === "active") return !user.banned && !user.locked;
    return false;
  });

  return {
    data: filtered.slice(0, limit),
    totalCount: filtered.length,
  };
}

/**
 * Helper Types
 */
export type ClerkUserData = {
  id: string;
  emailAddresses: Array<{ emailAddress: string }>;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  banned: boolean;
  locked: boolean;
  lockoutExpiresAt: number | null;
  createdAt: number;
  updatedAt: number;
  lastSignInAt: number | null;
  publicMetadata: Record<string, unknown>;
};
