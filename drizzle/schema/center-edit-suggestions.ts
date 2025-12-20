import { jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { bowlingCenters } from "./bowling-centers";
import { users } from "./users";

/**
 * Suggestion status enum
 */
export const suggestionStatusEnum = pgEnum("suggestion_status", ["pending", "approved", "rejected"]);

/**
 * Center Edit Suggestions table
 * Tracks user-suggested edits to bowling center information for admin review
 */
export const centerEditSuggestions = pgTable("center_edit_suggestions", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Which center is being edited
  bowlingCenterId: uuid("bowling_center_id")
    .notNull()
    .references(() => bowlingCenters.id, { onDelete: "cascade" }),

  // Who suggested the edit
  suggestedBy: uuid("suggested_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // The suggested changes (JSONB allows flexible field tracking)
  // Example: { "phone": "555-1234", "website": "https://newurl.com", "amenities": [...] }
  suggestedChanges: jsonb("suggested_changes")
    .$type<{
      name?: string;
      address?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
      phone?: string;
      email?: string;
      website?: string;
      latitude?: number;
      longitude?: number;
      numberOfLanes?: string;
      amenities?: string[];
    }>()
    .notNull(),

  // Justification for the edit
  notes: text("notes"),

  // Review workflow
  status: suggestionStatusEnum("status").notNull().default("pending"),
  reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
  reviewNotes: text("review_notes"),
  reviewedAt: timestamp("reviewed_at"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type CenterEditSuggestion = typeof centerEditSuggestions.$inferSelect;
export type NewCenterEditSuggestion = typeof centerEditSuggestions.$inferInsert;
