import { index, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { users } from "./users";

/**
 * Feedback Category Enum
 * Defines the type of feedback being submitted
 */
export const feedbackCategoryEnum = pgEnum("feedback_category", [
  "bug_report",
  "feature_request",
  "general_feedback",
  "other",
]);

/**
 * Feedback Status Enum
 * Tracks the lifecycle of feedback submission
 */
export const feedbackStatusEnum = pgEnum("feedback_status", [
  "submitted", // Initial state
  "under_review", // Admin is reviewing
  "planned", // Feature planned for implementation
  "in_progress", // Work in progress
  "completed", // Implemented/fixed
  "declined", // Not planned/won't fix
]);

/**
 * Feedback Priority Enum
 * Admin-assigned priority level
 */
export const feedbackPriorityEnum = pgEnum("feedback_priority", [
  "low",
  "medium",
  "high",
  "critical",
]);

/**
 * Feedback Table
 * User-submitted product feedback (bugs, features, suggestions)
 */
export const feedback = pgTable(
  "feedback",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // User info
    submittedBy: uuid("submitted_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Feedback content
    category: feedbackCategoryEnum("category").notNull(),
    title: text("title").notNull(), // Brief title (max 100 chars)
    description: text("description").notNull(), // Detailed description (min 20 chars)

    // Status tracking
    status: feedbackStatusEnum("status").notNull().default("submitted"),
    priority: feedbackPriorityEnum("priority"), // Admin-assigned

    // Admin response
    respondedBy: uuid("responded_by").references(() => users.id, { onDelete: "set null" }),
    adminResponse: text("admin_response"), // Admin's response to user
    internalNotes: text("internal_notes"), // Admin-only notes (not visible to user)
    respondedAt: timestamp("responded_at"),

    // Metadata
    tags: text("tags").array(), // Optional tags for filtering (e.g., ["mobile", "ui", "performance"])
    upvotes: uuid("upvotes").array().default([]), // Array of user IDs who upvoted (future feature)

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    submittedByIdx: index("idx_feedback_submitted_by").on(table.submittedBy),
    statusIdx: index("idx_feedback_status").on(table.status),
    categoryIdx: index("idx_feedback_category").on(table.category),
    priorityIdx: index("idx_feedback_priority").on(table.priority),
    createdAtIdx: index("idx_feedback_created_at").on(table.createdAt),
  }),
);

export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;
export type FeedbackCategory = "bug_report" | "feature_request" | "general_feedback" | "other";
export type FeedbackStatus =
  | "submitted"
  | "under_review"
  | "planned"
  | "in_progress"
  | "completed"
  | "declined";
export type FeedbackPriority = "low" | "medium" | "high" | "critical";
