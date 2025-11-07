import { boolean, date, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { bowlingCenters } from "./bowling-centers";
import { competitionLevelEnum } from "./player-profiles";

/**
 * Leagues table
 * Bowling league information
 */
export const leagues = pgTable("leagues", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  bowlingCenterId: uuid("bowling_center_id")
    .notNull()
    .references(() => bowlingCenters.id, { onDelete: "cascade" }),

  competitionLevel: competitionLevelEnum("competition_level").notNull(),
  description: text("description"),

  // Season Information
  seasonStartDate: date("season_start_date"),
  seasonEndDate: date("season_end_date"),

  // Schedule
  dayOfWeek: text("day_of_week").notNull(),
  startTime: text("start_time").notNull(),

  // League Details
  numberOfWeeks: text("number_of_weeks"),
  costPerBowler: text("cost_per_bowler"),

  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type League = typeof leagues.$inferSelect;
export type NewLeague = typeof leagues.$inferInsert;
