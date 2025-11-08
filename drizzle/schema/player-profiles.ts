import { boolean, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { bowlingCenters } from "./bowling-centers";
import { users } from "./users";

// Enums
export const genderEnum = pgEnum("gender", ["male", "female", "other", "prefer_not_to_say"]);
export const bowlingHandEnum = pgEnum("bowling_hand", ["left", "right"]);
export const teamTypeEnum = pgEnum("team_type", ["singles", "doubles", "team"]);
export const teamGenderTypeEnum = pgEnum("team_gender_type", ["male", "female", "mixed"]);
export const competitionLevelEnum = pgEnum("competition_level", [
  "recreational",
  "league",
  "competitive",
  "professional",
]);

/**
 * Player Profiles table
 * Bowling-specific information for each user
 * USBC Member ID is the PRIMARY verification credential
 */
export const playerProfiles = pgTable("player_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),

  // CRITICAL: USBC Verification (Most Important Field)
  usbcMemberId: text("usbc_member_id").notNull().unique(),
  usbcVerified: boolean("usbc_verified").notNull().default(false),
  usbcVerifiedAt: timestamp("usbc_verified_at"),

  // Basic Demographics
  gender: genderEnum("gender").notNull(),
  dateOfBirth: timestamp("date_of_birth"),
  phone: text("phone"),

  // Bowling Information
  bowlingHand: bowlingHandEnum("bowling_hand").notNull(),
  homeBowlingCenterId: uuid("home_bowling_center_id").references(() => bowlingCenters.id),

  // Statistics (can be auto-populated from USBC or manually entered)
  currentAverage: integer("current_average"), // Current bowling average
  highGame: integer("high_game"), // Highest single game score
  highSeries: integer("high_series"), // Highest 3-game series
  yearsExperience: integer("years_experience"),

  // Availability & Preferences
  availability: jsonb("availability").$type<{
    monday?: string[];
    tuesday?: string[];
    wednesday?: string[];
    thursday?: string[];
    friday?: string[];
    saturday?: string[];
    sunday?: string[];
  }>(),
  preferredTeamTypes: teamTypeEnum("preferred_team_types").array(),
  preferredTeamGenderTypes: teamGenderTypeEnum("preferred_team_gender_types").array(),
  preferredCompetitionLevel: competitionLevelEnum("preferred_competition_level"),

  // Matchmaking Status
  lookingForTeam: boolean("looking_for_team").notNull().default(false),
  openToSubstitute: boolean("open_to_substitute").notNull().default(false),

  // Profile Content
  bio: text("bio"),
  achievements: text("achievements").array(),

  // Metadata
  profileComplete: boolean("profile_complete").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type PlayerProfile = typeof playerProfiles.$inferSelect;
export type NewPlayerProfile = typeof playerProfiles.$inferInsert;
