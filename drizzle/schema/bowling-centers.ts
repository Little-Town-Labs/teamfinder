import { boolean, decimal, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Bowling Centers table
 * Directory of bowling centers/alleys
 */
export const bowlingCenters = pgTable(
  "bowling_centers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    address: text("address").notNull(),
    city: text("city").notNull(),
    state: text("state").notNull(),
    zipCode: text("zip_code").notNull(),
    country: text("country").notNull().default("USA"),
    phone: text("phone"),
    email: text("email"),
    website: text("website"),
    // Geographic coordinates for distance calculations
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),
    // Additional info
    numberOfLanes: text("number_of_lanes"),
    amenities: text("amenities").array(), // ['pro shop', 'food', 'bar', etc.]

    // Admin verification and moderation
    verified: boolean("verified").notNull().default(false),
    flaggedForReview: boolean("flagged_for_review").notNull().default(false),
    flaggedReason: text("flagged_reason"),
    addedBy: uuid("added_by"), // Soft reference to users.id (admin who created)
    lastVerifiedAt: timestamp("last_verified_at"),
    lastVerifiedBy: uuid("last_verified_by"), // Soft reference to users.id (admin who verified)

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    cityIdx: index("idx_bowling_centers_city").on(table.city),
    stateIdx: index("idx_bowling_centers_state").on(table.state),
    zipCodeIdx: index("idx_bowling_centers_zip_code").on(table.zipCode),
    latLngIdx: index("idx_bowling_centers_lat_lng").on(table.latitude, table.longitude),
    verifiedIdx: index("idx_bowling_centers_verified").on(table.verified),
  }),
);

export type BowlingCenter = typeof bowlingCenters.$inferSelect;
export type NewBowlingCenter = typeof bowlingCenters.$inferInsert;
