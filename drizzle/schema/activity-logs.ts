import { pgEnum, pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";
import { users } from "./users";
import { teams } from "./teams";

/**
 * Activity types enum
 * Tracks different types of activities in the system
 */
export const activityTypeEnum = pgEnum("activity_type", [
  // Team invitations
  "team_invitation_sent",
  "team_invitation_accepted",
  "team_invitation_declined",

  // Player applications
  "player_application_sent",
  "player_application_accepted",
  "player_application_declined",

  // Team membership
  "team_joined",
  "team_left",
  "team_member_removed",

  // Team management
  "team_created",
  "team_updated",
  "team_deleted",

  // Messages
  "message_received",
  "conversation_started",

  // Profile updates
  "profile_updated",
  "profile_verified",
]);

/**
 * Activity logs table
 * Centralized activity tracking for dashboard feeds and notifications
 */
export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").primaryKey().defaultRandom(),

  // The user this activity belongs to (whose feed it should appear in)
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Type of activity
  activityType: activityTypeEnum("activity_type").notNull(),

  // Actor (who performed the action, can be null for system activities)
  actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
  actorName: text("actor_name"), // Cached for display

  // Related team (if applicable)
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "cascade" }),
  teamName: text("team_name"), // Cached for display

  // Message to display
  message: text("message").notNull(),

  // Additional metadata (flexible JSON for type-specific data)
  metadata: jsonb("metadata"),

  // Link for "View" action
  actionUrl: text("action_url"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
