import { boolean, index, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Privacy consent types enum
 * Tracks different types of privacy and legal consents
 */
export const privacyConsentTypeEnum = pgEnum("privacy_consent_type", [
  "privacy_policy",
  "terms_of_service",
  "cookie_policy",
  "marketing_emails",
]);

/**
 * Privacy consents table
 * Tracks user consent to privacy policies, terms of service, and other legal agreements
 * Required for GDPR, CCPA, and other privacy regulation compliance
 */
export const privacyConsents = pgTable(
  "privacy_consents",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // User who gave consent
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Type of consent
    consentType: privacyConsentTypeEnum("consent_type").notNull(),

    // Version of the policy/agreement (e.g., "1.0", "1.1", "2.0")
    consentVersion: text("consent_version").notNull(),

    // Whether consent was accepted or rejected
    accepted: boolean("accepted").notNull(),

    // Metadata for audit trail
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),

    // When consent was given
    consentedAt: timestamp("consented_at").notNull().defaultNow(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("idx_privacy_consents_user_id").on(table.userId),
    consentTypeIdx: index("idx_privacy_consents_type").on(table.consentType),
    consentedAtIdx: index("idx_privacy_consents_consented_at").on(table.consentedAt),
  }),
);

export type PrivacyConsent = typeof privacyConsents.$inferSelect;
export type NewPrivacyConsent = typeof privacyConsents.$inferInsert;
