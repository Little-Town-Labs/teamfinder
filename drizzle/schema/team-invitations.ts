import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { teams } from "./teams";
import { users } from "./users";

// Invitation status
export const invitationStatusEnum = pgEnum("invitation_status", [
  "pending",
  "accepted",
  "declined",
  "expired",
]);

/**
 * Team Invitations table
 * Teams inviting players to join
 */
export const teamInvitations = pgTable("team_invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  invitedUserId: uuid("invited_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  invitedByUserId: uuid("invited_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  status: invitationStatusEnum("status").notNull().default("pending"),
  message: text("message"),

  expiresAt: timestamp("expires_at"),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type TeamInvitation = typeof teamInvitations.$inferSelect;
export type NewTeamInvitation = typeof teamInvitations.$inferInsert;
