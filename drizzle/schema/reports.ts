import { index, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { bowlingCenters } from "./bowling-centers";
import { messages } from "./messages";
import { teams } from "./teams";
import { users } from "./users";

/**
 * Report Type Enum
 * Defines what type of entity is being reported
 */
export const reportTypeEnum = pgEnum("report_type", ["user", "team", "message", "bowling_center"]);

/**
 * Report Reason Enum
 * Predefined reasons for reporting content
 */
export const reportReasonEnum = pgEnum("report_reason", [
  "inappropriate_content",
  "harassment",
  "spam",
  "fake_profile",
  "incorrect_information",
  "other",
]);

/**
 * Report Status Enum
 * Tracks the lifecycle of a report
 */
export const reportStatusEnum = pgEnum("report_status", [
  "pending",
  "investigating",
  "resolved",
  "dismissed",
]);

/**
 * Reports Table
 * User-submitted reports for content moderation
 */
export const reports = pgTable(
  "reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reportedBy: uuid("reported_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reportType: reportTypeEnum("report_type").notNull(),

    // Polymorphic references - only one should be set
    reportedUserId: uuid("reported_user_id").references(() => users.id, { onDelete: "cascade" }),
    reportedTeamId: uuid("reported_team_id").references(() => teams.id, { onDelete: "cascade" }),
    reportedMessageId: uuid("reported_message_id").references(() => messages.id, {
      onDelete: "cascade",
    }),
    reportedCenterId: uuid("reported_center_id").references(() => bowlingCenters.id, {
      onDelete: "cascade",
    }),

    reason: reportReasonEnum("reason").notNull(),
    description: text("description").notNull(),
    status: reportStatusEnum("status").notNull().default("pending"),

    // Review information
    reviewedBy: uuid("reviewed_by").references(() => users.id),
    reviewNotes: text("review_notes"),
    actionTaken: text("action_taken"),
    reviewedAt: timestamp("reviewed_at"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    reportedByIdx: index("idx_reports_reported_by").on(table.reportedBy),
    statusIdx: index("idx_reports_status").on(table.status),
    createdAtIdx: index("idx_reports_created_at").on(table.createdAt),
    reportTypeIdx: index("idx_reports_report_type").on(table.reportType),
  }),
);

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
export type ReportType = "user" | "team" | "message" | "bowling_center";
export type ReportReason =
  | "inappropriate_content"
  | "harassment"
  | "spam"
  | "fake_profile"
  | "incorrect_information"
  | "other";
export type ReportStatus = "pending" | "investigating" | "resolved" | "dismissed";
