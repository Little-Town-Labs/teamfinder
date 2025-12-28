import { index, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { users } from "./users";

/**
 * Admin Action Type Enum
 * Defines all possible admin actions for audit logging
 */
export const adminActionTypeEnum = pgEnum("admin_action_type", [
  // User moderation (via Clerk APIs)
  "user_locked",
  "user_unlocked",
  "user_banned",
  "user_unbanned",
  "user_usbc_verified",
  "user_profile_edited",

  // Team moderation
  "team_edited",
  "team_deleted",
  "team_flagged",
  "team_unflagged",

  // Bowling center management
  "center_created",
  "center_edited",
  "center_deleted",
  "center_suggestion_approved",
  "center_suggestion_rejected",

  // Report handling
  "report_reviewed",
  "report_dismissed",
  "content_deleted",

  // Feedback management
  "feedback_responded",
  "feedback_status_updated",
  "feedback_priority_set",

  // Admin management
  "admin_role_assigned",
  "admin_role_revoked",

  // System settings
  "settings_update",
]);

/**
 * Admin Actions Table
 * Comprehensive audit log of all admin actions
 */
export const adminActions = pgTable(
  "admin_actions",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // Admin who performed the action
    adminId: uuid("admin_id")
      .notNull()
      .references(() => users.id),
    adminName: text("admin_name").notNull(), // Snapshot at time of action
    adminRole: text("admin_role").notNull(), // Role at time of action

    // Action details
    actionType: adminActionTypeEnum("action_type").notNull(),
    targetType: text("target_type").notNull(), // "user", "team", "center", "report", "feedback", "admin", "setting"
    targetId: uuid("target_id").notNull(),
    targetDescription: text("target_description"), // Human-readable description

    // Context
    reason: text("reason"), // Admin's reason for the action
    previousValue: jsonb("previous_value"), // State before action
    newValue: jsonb("new_value"), // State after action
    metadata: jsonb("metadata"), // Additional context

    // Request context
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    adminIdIdx: index("idx_admin_actions_admin_id").on(table.adminId),
    actionTypeIdx: index("idx_admin_actions_action_type").on(table.actionType),
    targetIdIdx: index("idx_admin_actions_target_id").on(table.targetId),
    targetTypeIdx: index("idx_admin_actions_target_type").on(table.targetType),
    createdAtIdx: index("idx_admin_actions_created_at").on(table.createdAt),
  }),
);

export type AdminAction = typeof adminActions.$inferSelect;
export type NewAdminAction = typeof adminActions.$inferInsert;
export type AdminActionType =
  | "user_locked"
  | "user_unlocked"
  | "user_banned"
  | "user_unbanned"
  | "user_usbc_verified"
  | "user_profile_edited"
  | "team_edited"
  | "team_deleted"
  | "team_flagged"
  | "team_unflagged"
  | "center_created"
  | "center_edited"
  | "center_deleted"
  | "center_suggestion_approved"
  | "center_suggestion_rejected"
  | "report_reviewed"
  | "report_dismissed"
  | "content_deleted"
  | "feedback_responded"
  | "feedback_status_updated"
  | "feedback_priority_set"
  | "admin_role_assigned"
  | "admin_role_revoked"
  | "settings_update";
