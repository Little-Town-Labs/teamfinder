import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Messages table
 * Direct messaging between users (players, team captains)
 */
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  senderId: uuid("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  recipientId: uuid("recipient_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  subject: text("subject"),
  content: text("content").notNull(),

  isRead: boolean("is_read").notNull().default(false),
  readAt: timestamp("read_at"),

  // For threading/replies
  parentMessageId: uuid("parent_message_id").references((): any => messages.id),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
