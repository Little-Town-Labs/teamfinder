import { boolean, index, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { adminRoleEnum } from "./admin-roles";

/**
 * Permissions Table
 * Defines granular permissions for admin actions
 */
export const permissions = pgTable(
  "permissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(), // e.g., "manage_users", "moderate_teams"
    description: text("description").notNull(),
    category: text("category").notNull(), // "users", "teams", "centers", "reports", etc.
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => ({
    nameIdx: index("idx_permissions_name").on(table.name),
    categoryIdx: index("idx_permissions_category").on(table.category),
  }),
);

/**
 * Role Permissions Table
 * Maps admin roles to their permissions
 */
export const rolePermissions = pgTable(
  "role_permissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    role: adminRoleEnum("role").notNull(),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
  },
  (table) => ({
    roleIdx: index("idx_role_permissions_role").on(table.role),
    permissionIdx: index("idx_role_permissions_permission_id").on(table.permissionId),
  }),
);

export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type NewRolePermission = typeof rolePermissions.$inferInsert;

/**
 * Predefined permission names
 */
export const PERMISSIONS = {
  // User management
  VIEW_USERS: "view_users",
  BAN_USERS: "ban_users",
  LOCK_USERS: "lock_users",
  VERIFY_USBC: "verify_usbc",
  EDIT_USER_PROFILES: "edit_user_profiles",

  // Team management
  VIEW_TEAMS: "view_teams",
  EDIT_TEAMS: "edit_teams",
  DELETE_TEAMS: "delete_teams",
  MODERATE_TEAMS: "moderate_teams",

  // Bowling centers
  VIEW_CENTERS: "view_centers",
  CREATE_CENTERS: "create_centers",
  EDIT_CENTERS: "edit_centers",
  DELETE_CENTERS: "delete_centers",
  REVIEW_CENTER_SUGGESTIONS: "review_center_suggestions",

  // Reports
  VIEW_REPORTS: "view_reports",
  RESOLVE_REPORTS: "resolve_reports",
  DELETE_CONTENT: "delete_content",

  // Analytics
  VIEW_ANALYTICS: "view_analytics",
  EXPORT_DATA: "export_data",

  // Audit
  VIEW_AUDIT_LOGS: "view_audit_logs",

  // Admin management
  MANAGE_ADMINS: "manage_admins",
} as const;
