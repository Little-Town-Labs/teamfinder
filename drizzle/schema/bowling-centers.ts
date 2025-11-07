import { decimal, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Bowling Centers table
 * Directory of bowling centers/alleys
 */
export const bowlingCenters = pgTable("bowling_centers", {
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
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type BowlingCenter = typeof bowlingCenters.$inferSelect;
export type NewBowlingCenter = typeof bowlingCenters.$inferInsert;
