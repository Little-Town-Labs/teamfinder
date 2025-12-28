/**
 * Permission System Utilities
 * Handles admin permission checking with Clerk integration
 */

import { eq } from "drizzle-orm";

import type { AdminRoleType } from "@/drizzle/schema/admin-roles";
import { PERMISSIONS, rolePermissions } from "@/drizzle/schema/permissions";
import { db } from "@/lib/db";

import { isAdmin as checkIsAdmin, getUserAdminRole } from "./clerk-integration";

/**
 * Role-Permission Mappings
 * Defines which permissions each role has
 */
const ROLE_PERMISSIONS: Record<AdminRoleType, string[]> = {
  super_admin: ["*"], // All permissions
  moderator: [
    // User management
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.BAN_USERS,
    PERMISSIONS.LOCK_USERS,
    PERMISSIONS.VERIFY_USBC,
    PERMISSIONS.EDIT_USER_PROFILES,
    // Team management
    PERMISSIONS.VIEW_TEAMS,
    PERMISSIONS.EDIT_TEAMS,
    PERMISSIONS.DELETE_TEAMS,
    PERMISSIONS.MODERATE_TEAMS,
    // Centers
    PERMISSIONS.VIEW_CENTERS,
    PERMISSIONS.CREATE_CENTERS,
    PERMISSIONS.EDIT_CENTERS,
    PERMISSIONS.DELETE_CENTERS,
    PERMISSIONS.REVIEW_CENTER_SUGGESTIONS,
    // Reports
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.RESOLVE_REPORTS,
    PERMISSIONS.DELETE_CONTENT,
    // Feedback
    PERMISSIONS.VIEW_FEEDBACK,
    PERMISSIONS.RESPOND_TO_FEEDBACK,
    PERMISSIONS.MANAGE_FEEDBACK,
    // Analytics
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_DATA,
    // Audit
    PERMISSIONS.VIEW_AUDIT_LOGS,
  ],
  content_reviewer: [
    // View-only + reports
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_TEAMS,
    PERMISSIONS.VIEW_CENTERS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.RESOLVE_REPORTS,
    PERMISSIONS.VIEW_FEEDBACK,
    PERMISSIONS.RESPOND_TO_FEEDBACK,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
  ],
  support: [
    // Read-only access
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_TEAMS,
    PERMISSIONS.VIEW_CENTERS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_FEEDBACK,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
  ],
};

/**
 * Core Permission Checking Functions
 */

/**
 * Check if user is an admin (has any admin role)
 */
export async function isAdmin(clerkUserId: string): Promise<boolean> {
  return await checkIsAdmin(clerkUserId);
}

/**
 * Get user's admin role from Clerk
 */
export async function getAdminRole(clerkUserId: string): Promise<AdminRoleType | null> {
  return await getUserAdminRole(clerkUserId);
}

/**
 * Check if user has a specific permission
 */
export async function hasPermission(
  clerkUserId: string,
  permissionName: string,
): Promise<boolean> {
  const role = await getAdminRole(clerkUserId);
  if (!role) return false;

  const permissions = ROLE_PERMISSIONS[role];

  // Super admin has all permissions
  if (permissions.includes("*")) return true;

  // Check if role has the specific permission
  return permissions.includes(permissionName);
}

/**
 * Get all permissions for a user's role
 */
export async function getUserPermissions(clerkUserId: string): Promise<string[]> {
  const role = await getAdminRole(clerkUserId);
  if (!role) return [];

  return ROLE_PERMISSIONS[role];
}

/**
 * Require user to be an admin (throw if not)
 */
export async function requireAdmin(clerkUserId: string): Promise<void> {
  const admin = await isAdmin(clerkUserId);
  if (!admin) {
    throw new Error("Unauthorized: Admin access required");
  }
}

/**
 * Require user to have a specific permission (throw if not)
 */
export async function requirePermission(
  clerkUserId: string,
  permissionName: string,
): Promise<void> {
  const permitted = await hasPermission(clerkUserId, permissionName);
  if (!permitted) {
    throw new Error(`Unauthorized: Missing permission '${permissionName}'`);
  }
}

/**
 * Check if user has any of the given permissions
 */
export async function hasAnyPermission(
  clerkUserId: string,
  permissionNames: string[],
): Promise<boolean> {
  const role = await getAdminRole(clerkUserId);
  if (!role) return false;

  const permissions = ROLE_PERMISSIONS[role];

  // Super admin has all permissions
  if (permissions.includes("*")) return true;

  // Check if role has any of the permissions
  return permissionNames.some((p) => permissions.includes(p));
}

/**
 * Check if user has all of the given permissions
 */
export async function hasAllPermissions(
  clerkUserId: string,
  permissionNames: string[],
): Promise<boolean> {
  const role = await getAdminRole(clerkUserId);
  if (!role) return false;

  const permissions = ROLE_PERMISSIONS[role];

  // Super admin has all permissions
  if (permissions.includes("*")) return true;

  // Check if role has all of the permissions
  return permissionNames.every((p) => permissions.includes(p));
}

/**
 * Database-backed permission checking (for future extensibility)
 * This allows permissions to be modified in the database without code changes
 */
export async function getPermissionsFromDatabase(
  role: AdminRoleType,
): Promise<{ id: string; name: string; description: string }[]> {
  const result = await db.query.rolePermissions.findMany({
    where: eq(rolePermissions.role, role),
    with: {
      permission: true,
    },
  });

  return result.map((rp) => rp.permission);
}

/**
 * Helper to get human-readable role name
 */
export function getRoleName(role: AdminRoleType): string {
  const names: Record<AdminRoleType, string> = {
    super_admin: "Super Admin",
    moderator: "Moderator",
    content_reviewer: "Content Reviewer",
    support: "Support",
  };
  return names[role];
}

/**
 * Get all available permissions
 */
export function getAllPermissions(): Array<{ name: string; category: string }> {
  return Object.entries(PERMISSIONS).map(([key, value]) => ({
    name: value,
    category: key.split("_")[0]?.toLowerCase() || "general", // Extract category from permission name
  }));
}
