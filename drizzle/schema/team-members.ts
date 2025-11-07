import { pgTable, timestamp, uuid, pgEnum, unique } from "drizzle-orm/pg-core";
import { teams } from "./teams";
import { users } from "./users";

// Role in team
export const teamRoleEnum = pgEnum("team_role", ["captain", "co_captain", "member", "substitute"]);

/**
 * Team Members table
 * Junction table for team membership with roles
 */
export const teamMembers = pgTable(
  "team_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: teamRoleEnum("role").notNull().default("member"),
    joinedAt: timestamp("joined_at").notNull().defaultNow(),
    leftAt: timestamp("left_at"),
  },
  (table) => ({
    // Ensure a user can only be on a team once (unless they left and rejoined)
    uniqueActiveTeamMember: unique().on(table.teamId, table.userId),
  }),
);

export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
