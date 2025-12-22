import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Users table - Synced with Clerk authentication
 * This table stores minimal user data, with Clerk handling auth
 *
 * NOTE: User ban/lock status is managed by Clerk APIs, not in this table.
 * See lib/admin/clerk-integration.ts for user moderation functions.
 */
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkUserId: text("clerk_user_id").notNull().unique(),
    email: text("email").notNull().unique(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    imageUrl: text("image_url"),

    // Admin-managed fields
    usbcVerificationNotes: text("usbc_verification_notes"), // Admin notes for USBC verification
    lastVerifiedAt: timestamp("last_verified_at"), // When USBC was last verified
    lastVerifiedBy: uuid("last_verified_by"), // Admin who verified (soft reference to users.id)

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    clerkUserIdIdx: index("idx_users_clerk_user_id").on(table.clerkUserId),
    emailIdx: index("idx_users_email").on(table.email),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
