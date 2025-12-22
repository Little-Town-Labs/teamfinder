import { index, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { users } from "./users";

/**
 * Admin Role Enum
 * Defines the different levels of admin access
 */
export const adminRoleEnum = pgEnum("admin_role", [
  "super_admin", // Full system access
  "moderator", // User & team moderation
  "content_reviewer", // Review reports & content
  "support", // Read-only + basic support
]);

/**
 * Admin Roles Table
 * Tracks admin role assignments for audit purposes
 * NOTE: The source of truth for admin roles is Clerk publicMetadata
 * This table provides historical tracking and audit trail
 */
export const adminRoles = pgTable(
  "admin_roles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    role: adminRoleEnum("role").notNull(),
    assignedBy: uuid("assigned_by").references(() => users.id),
    assignedAt: timestamp("assigned_at").notNull().defaultNow(),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("idx_admin_roles_user_id").on(table.userId),
    roleIdx: index("idx_admin_roles_role").on(table.role),
  }),
);

export type AdminRole = typeof adminRoles.$inferSelect;
export type NewAdminRole = typeof adminRoles.$inferInsert;
export type AdminRoleType = "super_admin" | "moderator" | "content_reviewer" | "support";
