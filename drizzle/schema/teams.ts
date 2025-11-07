import { pgTable, text, timestamp, uuid, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { users } from "./users";
import { bowlingCenters } from "./bowling-centers";
import { teamTypeEnum, competitionLevelEnum, genderEnum } from "./player-profiles";

/**
 * Teams table
 * Represents bowling teams looking for players or competing
 */
export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  captainId: uuid("captain_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Team Classification
  teamType: teamTypeEnum("team_type").notNull(),
  genderType: genderEnum("gender_type").notNull(), // For mens/womens/mixed teams
  competitionLevel: competitionLevelEnum("competition_level").notNull(),

  // Location & Schedule
  homeBowlingCenterId: uuid("home_bowling_center_id").references(() => bowlingCenters.id),
  bowlingSchedule: jsonb("bowling_schedule").$type<{
    dayOfWeek: string;
    startTime: string;
    leagueName?: string;
  }>(),

  // Team Statistics
  teamAverage: integer("team_average"),
  currentStanding: text("current_standing"),
  seasonsActive: integer("seasons_active").default(0),

  // Roster Management
  maxRosterSize: integer("max_roster_size").notNull().default(5),
  currentRosterSize: integer("current_roster_size").notNull().default(1),

  // Recruitment
  lookingForPlayers: boolean("looking_for_players").notNull().default(false),
  openPositions: integer("open_positions").notNull().default(0),
  recruitmentRequirements: jsonb("recruitment_requirements").$type<{
    minAverage?: number;
    maxAverage?: number;
    experienceLevel?: string;
    availability?: string[];
    additionalNotes?: string;
  }>(),

  // Team Profile
  description: text("description"),
  logoUrl: text("logo_url"),
  achievements: text("achievements").array(),

  // Metadata
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
