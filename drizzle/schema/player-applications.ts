import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { invitationStatusEnum } from "./team-invitations";
import { teams } from "./teams";
import { users } from "./users";

/**
 * Player Applications table
 * Players applying to join teams
 */
export const playerApplications = pgTable("player_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  applicantUserId: uuid("applicant_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  status: invitationStatusEnum("status").notNull().default("pending"),
  message: text("message"),
  coverLetter: text("cover_letter"),

  reviewedByUserId: uuid("reviewed_by_user_id").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type PlayerApplication = typeof playerApplications.$inferSelect;
export type NewPlayerApplication = typeof playerApplications.$inferInsert;
