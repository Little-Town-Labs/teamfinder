import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Affiliation types enum
 */
export const affiliationTypeEnum = pgEnum("affiliation_type", ["college", "company", "organization", "other"]);

/**
 * Affiliations table
 * Stores user affiliations like colleges, companies, organizations
 */
export const affiliations = pgTable("affiliations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  type: affiliationTypeEnum("type").notNull(),
  name: text("name").notNull(),

  // Optional details
  role: text("role"), // e.g., "Student", "Employee", "Member"
  startYear: text("start_year"), // e.g., "2015"
  endYear: text("end_year"), // e.g., "2019" or "Present"

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Affiliation = typeof affiliations.$inferSelect;
export type NewAffiliation = typeof affiliations.$inferInsert;
