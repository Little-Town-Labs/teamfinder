/**
 * Admin Audit Logger
 * Logs all admin actions for compliance and security
 */

import { headers } from "next/headers";

import type { AdminActionType } from "@/drizzle/schema/admin-actions";
import { adminActions } from "@/drizzle/schema/admin-actions";
import { db } from "@/lib/db";

import { getAdminRole } from "./permissions";

/**
 * Core audit logging function
 */
export interface LogAdminActionParams {
  adminClerkUserId: string;
  adminName: string;
  actionType: AdminActionType;
  targetType: "user" | "team" | "center" | "report" | "admin" | "setting";
  targetId: string;
  targetDescription?: string;
  reason?: string;
  previousValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export async function logAdminAction(params: LogAdminActionParams): Promise<void> {
  const {
    adminClerkUserId,
    adminName,
    actionType,
    targetType,
    targetId,
    targetDescription,
    reason,
    previousValue,
    newValue,
    metadata,
  } = params;

  // Get admin's current role
  const adminRole = await getAdminRole(adminClerkUserId);
  if (!adminRole) {
    throw new Error("Cannot log action: User is not an admin");
  }

  // Get request context
  const headersList = await headers();
  const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
  const userAgent = headersList.get("user-agent") || "unknown";

  // Insert audit log
  await db.insert(adminActions).values({
    adminId: adminClerkUserId,
    adminName,
    adminRole,
    actionType,
    targetType,
    targetId,
    targetDescription,
    reason,
    previousValue: previousValue || null,
    newValue: newValue || null,
    metadata: metadata || null,
    ipAddress,
    userAgent,
  });
}

/**
 * Helper functions for common admin actions
 */

/**
 * Log user lock action
 */
export async function logUserLock(params: {
  adminClerkUserId: string;
  adminName: string;
  targetUserId: string;
  targetUserName: string;
  reason?: string;
}): Promise<void> {
  await logAdminAction({
    adminClerkUserId: params.adminClerkUserId,
    adminName: params.adminName,
    actionType: "user_locked",
    targetType: "user",
    targetId: params.targetUserId,
    targetDescription: `User: ${params.targetUserName}`,
    reason: params.reason,
    newValue: { locked: true },
  });
}

/**
 * Log user unlock action
 */
export async function logUserUnlock(params: {
  adminClerkUserId: string;
  adminName: string;
  targetUserId: string;
  targetUserName: string;
  reason?: string;
}): Promise<void> {
  await logAdminAction({
    adminClerkUserId: params.adminClerkUserId,
    adminName: params.adminName,
    actionType: "user_unlocked",
    targetType: "user",
    targetId: params.targetUserId,
    targetDescription: `User: ${params.targetUserName}`,
    reason: params.reason,
    newValue: { locked: false },
  });
}

/**
 * Log user ban action
 */
export async function logUserBan(params: {
  adminClerkUserId: string;
  adminName: string;
  targetUserId: string;
  targetUserName: string;
  reason?: string;
}): Promise<void> {
  await logAdminAction({
    adminClerkUserId: params.adminClerkUserId,
    adminName: params.adminName,
    actionType: "user_banned",
    targetType: "user",
    targetId: params.targetUserId,
    targetDescription: `User: ${params.targetUserName}`,
    reason: params.reason,
    newValue: { banned: true },
  });
}

/**
 * Log user unban action
 */
export async function logUserUnban(params: {
  adminClerkUserId: string;
  adminName: string;
  targetUserId: string;
  targetUserName: string;
  reason?: string;
}): Promise<void> {
  await logAdminAction({
    adminClerkUserId: params.adminClerkUserId,
    adminName: params.adminName,
    actionType: "user_unbanned",
    targetType: "user",
    targetId: params.targetUserId,
    targetDescription: `User: ${params.targetUserName}`,
    reason: params.reason,
    newValue: { banned: false },
  });
}

/**
 * Log USBC verification
 */
export async function logUsbcVerification(params: {
  adminClerkUserId: string;
  adminName: string;
  targetUserId: string;
  targetUserName: string;
  usbcId: string;
  notes?: string;
}): Promise<void> {
  await logAdminAction({
    adminClerkUserId: params.adminClerkUserId,
    adminName: params.adminName,
    actionType: "user_usbc_verified",
    targetType: "user",
    targetId: params.targetUserId,
    targetDescription: `User: ${params.targetUserName} (USBC ID: ${params.usbcId})`,
    newValue: { verified: true, usbcId: params.usbcId },
    metadata: { notes: params.notes },
  });
}

/**
 * Log team edit
 */
export async function logTeamEdit(params: {
  adminClerkUserId: string;
  adminName: string;
  teamId: string;
  teamName: string;
  previousData: Record<string, unknown>;
  newData: Record<string, unknown>;
  reason?: string;
}): Promise<void> {
  await logAdminAction({
    adminClerkUserId: params.adminClerkUserId,
    adminName: params.adminName,
    actionType: "team_edited",
    targetType: "team",
    targetId: params.teamId,
    targetDescription: `Team: ${params.teamName}`,
    reason: params.reason,
    previousValue: params.previousData,
    newValue: params.newData,
  });
}

/**
 * Log team deletion
 */
export async function logTeamDeletion(params: {
  adminClerkUserId: string;
  adminName: string;
  teamId: string;
  teamName: string;
  reason: string;
}): Promise<void> {
  await logAdminAction({
    adminClerkUserId: params.adminClerkUserId,
    adminName: params.adminName,
    actionType: "team_deleted",
    targetType: "team",
    targetId: params.teamId,
    targetDescription: `Team: ${params.teamName}`,
    reason: params.reason,
  });
}

/**
 * Log bowling center creation
 */
export async function logCenterCreation(params: {
  adminClerkUserId: string;
  adminName: string;
  centerId: string;
  centerName: string;
  centerData: Record<string, unknown>;
}): Promise<void> {
  await logAdminAction({
    adminClerkUserId: params.adminClerkUserId,
    adminName: params.adminName,
    actionType: "center_created",
    targetType: "center",
    targetId: params.centerId,
    targetDescription: `Center: ${params.centerName}`,
    newValue: params.centerData,
  });
}

/**
 * Log bowling center edit
 */
export async function logCenterEdit(params: {
  adminClerkUserId: string;
  adminName: string;
  centerId: string;
  centerName: string;
  previousData: Record<string, unknown>;
  newData: Record<string, unknown>;
  reason?: string;
}): Promise<void> {
  await logAdminAction({
    adminClerkUserId: params.adminClerkUserId,
    adminName: params.adminName,
    actionType: "center_edited",
    targetType: "center",
    targetId: params.centerId,
    targetDescription: `Center: ${params.centerName}`,
    reason: params.reason,
    previousValue: params.previousData,
    newValue: params.newData,
  });
}

/**
 * Log bowling center deletion
 */
export async function logCenterDeletion(params: {
  adminClerkUserId: string;
  adminName: string;
  centerId: string;
  centerName: string;
  reason: string;
}): Promise<void> {
  await logAdminAction({
    adminClerkUserId: params.adminClerkUserId,
    adminName: params.adminName,
    actionType: "center_deleted",
    targetType: "center",
    targetId: params.centerId,
    targetDescription: `Center: ${params.centerName}`,
    reason: params.reason,
  });
}

/**
 * Log report resolution
 */
export async function logReportResolution(params: {
  adminClerkUserId: string;
  adminName: string;
  reportId: string;
  reportType: string;
  actionTaken: string;
  notes?: string;
}): Promise<void> {
  await logAdminAction({
    adminClerkUserId: params.adminClerkUserId,
    adminName: params.adminName,
    actionType: "report_reviewed",
    targetType: "report",
    targetId: params.reportId,
    targetDescription: `Report Type: ${params.reportType}`,
    newValue: { actionTaken: params.actionTaken },
    metadata: { notes: params.notes },
  });
}

/**
 * Log admin role assignment
 */
export async function logAdminRoleAssignment(params: {
  adminClerkUserId: string;
  adminName: string;
  targetUserId: string;
  targetUserName: string;
  role: string;
  notes?: string;
}): Promise<void> {
  await logAdminAction({
    adminClerkUserId: params.adminClerkUserId,
    adminName: params.adminName,
    actionType: "admin_role_assigned",
    targetType: "admin",
    targetId: params.targetUserId,
    targetDescription: `User: ${params.targetUserName}`,
    newValue: { role: params.role },
    metadata: { notes: params.notes },
  });
}

/**
 * Log admin role revocation
 */
export async function logAdminRoleRevocation(params: {
  adminClerkUserId: string;
  adminName: string;
  targetUserId: string;
  targetUserName: string;
  previousRole: string;
  reason?: string;
}): Promise<void> {
  await logAdminAction({
    adminClerkUserId: params.adminClerkUserId,
    adminName: params.adminName,
    actionType: "admin_role_revoked",
    targetType: "admin",
    targetId: params.targetUserId,
    targetDescription: `User: ${params.targetUserName}`,
    previousValue: { role: params.previousRole },
    newValue: { role: null },
    reason: params.reason,
  });
}
